'use client'

import { useEffect, useRef } from 'react'

export default function BackupTrigger() {
  const backupDoneRef = useRef(false)

  useEffect(() => {
    // Hacer backup automático una sola vez por sesión
    if (backupDoneRef.current) return

    backupDoneRef.current = true

    fetch('/api/admin/backup-oauth', {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('✅ Backup automático completado')
        }
      })
      .catch(() => {
        // Silenciosamente ignorar errores
      })
  }, [])

  return null
}
