import React from 'react'
import { Cross2Icon } from "@radix-ui/react-icons"

export function IconExample() {
  return (
    <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md">
      <Cross2Icon className="w-6 h-6 text-red-500" />
      <span className="ml-2">Este es un ejemplo de icono de Radix UI</span>
    </div>
  )
}