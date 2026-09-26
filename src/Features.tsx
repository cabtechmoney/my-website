import { ShieldIcon, CartIcon, StarIcon } from './components/Icons';

export default function Features() {
  const features = [
    { title: 'Made to be kept', description: 'Thoughtful materials and details that reward a closer look.', icon: StarIcon },
    { title: 'A considered edit', description: 'Distinctive pieces, selected for how they feel and how they last.', icon: ShieldIcon },
    { title: 'With you all the way', description: 'Personal support from discovery through delivery.', icon: CartIcon },
  ];

  return (
    <section className="home-values">
      <div className="container">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.title} className="value-item">
              <IconComponent className="value-icon" size={22} color="currentColor" />
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

