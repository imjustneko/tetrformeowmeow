import { PlaceholderShell } from '@/components/layout/PlaceholderShell';

type Props = { params: Promise<{ username: string }> };

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  return (
    <PlaceholderShell
      title={`Player · ${decoded}`}
      description={`Public profile and match history for ${decoded} will load from GET /api/users/profile/:username once the UI is built out.`}
      backHref="/dashboard"
    />
  );
}
