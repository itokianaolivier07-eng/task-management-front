import { useCallback, useEffect, useState } from 'react'

/**
 * Charge des données au montage (et quand `deps` change).
 *   const { data, loading, error, reload } = useAsync(() => listWorkspaces(), [])
 * reload() relance le chargement (ex. après une création).
 */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fn()
      .then((result) => !cancelled && setData(result))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true // évite de mettre à jour un composant démonté
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, setData, loading, error, reload }
}
