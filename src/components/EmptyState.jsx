const CONTRIBUTE = 'https://github.com/ashish4903/maharashtra-darshan#adding-a-place-or-dish';

export default function EmptyState({ what }) {
  return (
    <p className="empty">
      No {what} added here yet. Entries are added only with a source.{' '}
      <a href={CONTRIBUTE} target="_blank" rel="noreferrer">
        Suggest one
      </a>
      .
    </p>
  );
}
