export interface MenuPizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
}

export const PIZZAS: MenuPizza[] = [
  {
    id: 'margherita',
    name: 'Classic Margherita',
    description: 'San Marzano tomato, fior di latte mozzarella, fresh basil, extra-virgin olive oil.',
    price: 299,
    image: '/margherita.jpg',
    tags: ['Bestseller', 'Vegetarian'],
  },
  {
    id: 'diavola',
    name: 'Spicy Diavola',
    description: 'Spicy arrabbiata, smoked scamorza, jalapeño, roasted peppers, chilli oil kick.',
    price: 379,
    image: '/diavola.jpg',
    tags: ['Spicy'],
  },
  {
    id: 'funghi',
    name: 'Tuscan Funghi',
    description: 'Garlic cream base, burrata, sautéed mushrooms, red onion, thyme, truffle drizzle.',
    price: 399,
    image: '/funghi.jpg',
    tags: ['Vegetarian'],
  },
  {
    id: 'pesto',
    name: 'Pesto Burrata',
    description: 'Pesto verde, creamy burrata, roasted peppers, black olives, fresh basil.',
    price: 419,
    image: '/pesto.jpg',
    tags: ['Chef\u2019s pick'],
  },
  {
    id: 'ortolana',
    name: 'Ortolana Garden',
    description: 'San Marzano, fior di latte, grilled vegetables, red onion, basil, olive oil.',
    price: 349,
    image: '/ortolana.jpg',
    tags: ['Vegetarian', 'Light'],
  },
];

export const BUILDER_OPTIONS = {
  base: [
    { name: 'Sourdough', price: 60 },
    { name: 'Classic', price: 0 },
    { name: 'Thin & Crispy', price: 30 },
    { name: 'Whole Wheat', price: 40 },
    { name: 'Gluten-free', price: 80 },
  ],
  sauce: [
    { name: 'San Marzano', price: 20 },
    { name: 'Spicy Arrabbiata', price: 25 },
    { name: 'Garlic Cream', price: 30 },
    { name: 'Pesto Verde', price: 35 },
    { name: 'No Sauce', price: 0 },
  ],
  cheese: [
    { name: 'Fior di latte', price: 40 },
    { name: 'Burrata', price: 70 },
    { name: 'Smoked Scamorza', price: 55 },
    { name: 'Vegan Mozzarella', price: 50 },
  ],
  vegetable: [
    { name: 'Basil', price: 10 },
    { name: 'Mushroom', price: 25 },
    { name: 'Roasted Pepper', price: 25 },
    { name: 'Red Onion', price: 15 },
    { name: 'Jalapeno', price: 20 },
    { name: 'Black Olive', price: 20 },
  ],
};

export const CUSTOM_BASE_PRICE = 180;