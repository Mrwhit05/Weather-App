function WeatherInsight({ insights }) {
  if (!insights?.length) {
    return <p>No notable forecast insights right now.</p>;
  }

  return (
    <section>
      <h2 className="font-semibold mb-3">Weather Insights</h2>
      {insights.map((insight) => (
        //<article key={insight.id}>
        //  <h3>{insight.title}</h3>
        //  <p>{insight.message}</p>
        //</article>

        //<div key={insight.id} className="border-1-4 rounded-lg p-3 mb-2">
        //  <div className="">
        //    <p className="font-semibold text-sm">{insight.title}</p>
        //    <p>{insight.message}</p>
        //  </div>
        //</div>

        <details key={insight.id} className="group border-l-4 border-blue-300 rounded-lg px-3 py-1.5 mb-1 open:bg-gray-50">
          <summary className="inline-flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-full bg-gray-100 hover:bg-gray-200 group-open:bg-blue-100 px-3 py-1 text-sm font-semibold transition-colors duration-150">
            {insight.title}
            <span className="text-sm leading-none transition-transform duration-150 group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-2 ml-1 text-sm text-gray-600">{insight.message}</p>
        </details>
      ))}
    </section>
  );
}

export default WeatherInsight;
