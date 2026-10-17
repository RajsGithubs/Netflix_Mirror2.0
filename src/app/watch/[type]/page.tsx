import { redirect } from 'next/navigation';

export default function WatchTypeDefaultPage({ params }: { params: { type: string } }) {
  if (params.type === 'movie') {
    redirect('/watch/movie/tt1375666');
  } else if (params.type === 'series') {
    redirect('/watch/series/tt0944947');
  }
  redirect('/');
}
