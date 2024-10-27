'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Copy, ArrowRight, Send } from 'lucide-react'

export default function Home() {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const { toast } = useToast()
  const outputRef = useRef<HTMLParagraphElement>(null)

  const processActivationCode = (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Código incompleto",
        description: "Por favor, ingrese un código válido.",
        variant: "destructive",
      })
      return
    }

    let lcSerialNumber = code.replace(/-/g, '')

    // Paso 1: Desempaquetar caracteres
    let lcUnPacketSerialNumber = ''
    for (let i = 0; i < lcSerialNumber.length; i++) {
      const lcCar = lcSerialNumber.charAt(i)
      const charCode = lcCar.charCodeAt(0)
      if (charCode >= 65 && charCode <= 90) {
        lcUnPacketSerialNumber += (charCode - 20).toString().padStart(2, '0')
      } else {
        lcUnPacketSerialNumber += lcCar
      }
    }
    lcSerialNumber = lcUnPacketSerialNumber

    // Paso 2: Desempaquetar el Desplazamiento (rotar a la izquierda seis veces)
    const lnDX = 12
    for (let j = 0; j < 6; j++) {
      lcSerialNumber = lcSerialNumber.slice(-lnDX) + lcSerialNumber.slice(0, -lnDX)
    }

    // Paso 3: Quitar Número de Contrato
    let lcProductNumber = ''
    const lnLen = parseInt(lcSerialNumber.charAt(0), 10)
    lcSerialNumber = '*' + lcSerialNumber.slice(1)
    for (let i = 1; i <= lnLen; i++) {
      const index = (i + 1) * 3
      if (index < lcSerialNumber.length) {
        lcProductNumber += lcSerialNumber.charAt(index - 1)
        lcSerialNumber = lcSerialNumber.slice(0, index - 1) + '*' + lcSerialNumber.slice(index)
      }
    }
    lcSerialNumber = lcSerialNumber.replace(/\*/g, '')
    lcProductNumber = parseInt(lcProductNumber, 10).toString().padStart(10, '0')

    // Paso 4
    let lcActivationCode = lcSerialNumber
    const lnLen2 = lcProductNumber.slice(0, 10).replace(/^0+/, '').length

    lcActivationCode = lnLen2.toString() + lcActivationCode

    for (let i = 0; i < lnLen2; i++) {
      const lcCar = lcProductNumber.charAt((10 - lnLen2) + i)
      const index = (i * 3) + 5
      lcActivationCode = lcActivationCode.slice(0, index) + lcCar + lcActivationCode.slice(index)
    }

    // Paso 5: Poner al revés
    lcActivationCode = lcActivationCode.split('').reverse().join('')

    // Paso 6: Rotar por la izquierda cinco veces
    for (let j = 0; j < 6; j++) {
      lcActivationCode = lcActivationCode.slice(lnDX) + lcActivationCode.slice(0, lnDX)
    }

    // Paso 7: Empaquetar con caracteres
    let lcPacketActivationCode = ''
    for (let i = 0; i < lcActivationCode.length; i += 2) {
      const lcTwins = lcActivationCode.substring(i, i + 2)
      const numVal = parseInt(lcTwins, 10)
      if (numVal + 25 >= 65 && numVal + 25 <= 90) {
        lcPacketActivationCode += String.fromCharCode(numVal + 25)
      } else {
        lcPacketActivationCode += lcTwins
      }
    }
    lcActivationCode = lcPacketActivationCode

    // Paso 8: Colocar divisor cada seis caracteres
    let lcSeparatedActivationCode = lcActivationCode.slice(0, 6)
    for (let i = 6; i < lcActivationCode.length; i += 6) {
      lcSeparatedActivationCode += '-' + lcActivationCode.slice(i, i + 6)
    }
    lcActivationCode = lcSeparatedActivationCode

    setOutputCode(lcActivationCode)
  }

  const copyToClipboard = async () => {
    if (!outputCode) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Para navegadores modernos
        await navigator.clipboard.writeText(outputCode);
        toast({
          title: "Código copiado",
          description: "El código de activación ha sido copiado al portapapeles.",
        });
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement("textarea");
        textArea.value = outputCode;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          toast({
            title: "Código copiado",
            description: "El código de activación ha sido copiado al portapapeles.",
          });
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          toast({
            title: "Error al copiar",
            description: "No se pudo copiar el código. Por favor, cópielo manualmente.",
            variant: "destructive",
          });
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el código. Por favor, cópielo manualmente.",
        variant: "destructive",
      });
    }
  };

  const sendWhatsApp = () => {
    if (!outputCode) return;
    
    const message = encodeURIComponent(`Código de activación: ${outputCode}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">Procesador de Código de Activación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="input-code" className="text-sm font-medium text-gray-700">
                  Ingrese el código:
                </label>
                <Input
                  id="input-code"
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ingrese el código"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={() => processActivationCode(inputCode)}
                className="w-full"
              >
                Procesar Código
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {outputCode && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-700">Código de salida:</h2>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <p ref={outputRef} className="text-lg font-mono break-all">{outputCode}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyToClipboard}
                      className="flex-1"
                    >
                      Copiar
                      <Copy className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendWhatsApp}
                      className="flex-1"
                    >
                      Enviar por WhatsApp
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </ToastProvider>
  )
}