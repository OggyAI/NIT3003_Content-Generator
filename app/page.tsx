// Owner: Oggy. The home URL sends users to their dashboard;
// proxy.ts redirects logged-out users from there to /login.
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
