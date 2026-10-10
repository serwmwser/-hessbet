// ШАБЛОН. Замените текст условиями, согласованными с вашим юристом, до запуска с реальными деньгами.
export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Terms of use (placeholder)</h1>
      <p>This is a placeholder. Replace it with legally reviewed terms before launch.</p>
      <ul className="list-disc ps-6 space-y-1 opacity-80">
        <li>The service is for adults (18+) only and may be unavailable in some jurisdictions.</li>
        <li>You may lose your stake. Only stake what you can afford to lose.</li>
        <li>Results are determined by the game server; stakes are held by a smart contract on Polygon.</li>
        <li>A 6% fee is taken from the pot when a game has a winner. Draws and cancellations are refunded in full.</li>
        <li>Cheating (engine assistance, multiple accounts, collusion) results in a ban.</li>
        <li>Responsible play: if gambling stops being fun, stop and seek help.</li>
      </ul>
    </main>
  );
}
