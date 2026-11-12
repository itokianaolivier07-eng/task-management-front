export const Loader = ({ label = 'Chargement…' }) => <p className="muted">{label}</p>
export const ErrorBanner = ({ message }) => (message ? <p className="error" role="alert">{message}</p> : null)
export const Empty = ({ children }) => <p className="empty">{children}</p>
