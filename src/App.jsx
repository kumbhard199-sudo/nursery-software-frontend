import { AuthProvider } from './hooks/useAuth';

export default function App({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
