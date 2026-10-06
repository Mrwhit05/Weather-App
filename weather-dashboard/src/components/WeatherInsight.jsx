function WeatherInsight({ insights }) {
  if (!insights?.length) {
    return <p>No notable forecast insights right now.</p>;
  }

  return (
    <section>
      <h2>Weather Insights</h2>
      {insights.map((insight) => (
        <article key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.message}</p>
        </article>
      ))}
    </section>
  );
}

export default WeatherInsight;
