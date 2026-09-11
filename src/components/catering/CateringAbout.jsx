import RevealText from '../RevealText.jsx';

export default function CateringAbout() {
  return (
    <section className="section">
      <div className="container grid grid--2">
        <div>
          <span className="eyebrow">About Us</span>
          <RevealText as="h2">Cooking With Tradition, Serving With Love</RevealText>
          <p>
            MI Catering Services has been crafting memorable dining experiences for weddings,
            housewarmings, and corporate gatherings. Our FSSAI-certified central kitchen blends
            time-tested family recipes with hygienic, large-scale preparation to serve every
            event with consistent quality.
          </p>
        </div>
        <div className="grid grid--2">
          {[
            'Weddings & Receptions',
            'Housewarmings & Banquets',
            'Corporate Events & Lunches',
            'Place Your Order — We Take Care of the Rest',
          ].map((c) => (
            <div className="card" key={c}>
              <h3>{c}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
