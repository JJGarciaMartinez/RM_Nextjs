import { useState, useEffect } from 'react'

const USER_ID_KEY = 'rm_user_id'

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get existing userId from localStorage
    let id = localStorage.getItem(USER_ID_KEY)

    // If no userId exists, create one
    if (!id) {
      id = generateUserId()
      localStorage.setItem(USER_ID_KEY, id)
    }

    setUserId(id)
  }, [])

  return userId
}
