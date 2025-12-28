import { redirect } from 'next/navigation';

export default function Home() {
  // Reindirizza alla pagina di login
  redirect('/auth/login');
}
