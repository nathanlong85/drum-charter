export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
        <h1 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
          Settings
        </h1>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 uppercase tracking-wide">
          Coming Soon
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          System settings and profile management are currently under development. Please check back
          later.
        </p>
      </div>
    </div>
  );
}
