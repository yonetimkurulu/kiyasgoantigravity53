import ClientKiyasGo from '../ClientKiyasGo.js';

export function generateStaticParams() {
  return [
    { category: 'elektronik' },
    { category: 'moda' },
    { category: 'ev-yasam' },
  ];
}

export default function CategoryPage({ params }) {
  return <ClientKiyasGo initialCategory={params.category} />;
}