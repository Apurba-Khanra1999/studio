import { redirect } from 'next/navigation';

export default function RootPage() {
  // The main layout will handle redirecting to /login if the user is not authenticated.
  redirect('/board');
}
