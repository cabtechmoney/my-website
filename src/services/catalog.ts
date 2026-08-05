import fallbackProducts from '../data/products.json';
import { products } from './api';
import type { Product as ApiProduct } from './api';

export interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

function mapProduct(product: ApiProduct): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category_slug || product.category_name.toLowerCase(),
    price: Number(product.price),
    image: product.image,
    description: product.description,
  };
}

export async function loadCatalog(): Promise<CatalogProduct[]> {
  try {
    return (await products.list()).map(mapProduct);
  } catch {
    return fallbackProducts;
  }
}
