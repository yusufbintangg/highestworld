export const categories = [
  {
    id: "atasan",
    name: "Atasan",
    slug: "atasan",
    icon: "Shirt",
    description: "Koleksi atasan bigsize premium untuk pria",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop",
    subcategories: [
      "Kaos Bigsize",
      "Polo Shirt",
      "Oversize T-Shirt",
      "Kemeja Bigsize",
      "Kemeja Pendek",
      "Kemeja Flanel",
      "Jersey Bigsize"
    ]
  },
  {
    id: "bawahan",
    name: "Bawahan",
    slug: "bawahan",
    icon: "Package",
    description: "Celana bigsize untuk berbagai aktivitas",
    image: "https://res.cloudinary.com/dopr9tvnv/image/upload/v1772867147/HCBP6_2_mnkecc?w=800&h=1000&fit=crop",
    subcategories: [
      "Celana Panjang Jumbo",
      "Celana Pendek Bigsize",
      "Chinos Pendek",
      "Cargo Pendek",
      "Jeans Pendek",
      "Running Pants",
      "Sweatpants",
      "Boxer Bigsize"
    ]
  },
  {
    id: "jaket",
    name: "Jaket & Outer",
    slug: "jaket-outer",
    icon: "Wind",
    description: "Jaket dan outer stylish untuk bigsize",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
    subcategories: [
      "Jaket Jumbo",
      "Windbreaker Big Size",
      "Jaket Baseball",
      "Sukajan & Varsity"
    ]
  },
  {
    id: "outfit-set",
    name: "Outfit Set",
    slug: "outfit-set",
    icon: "ShoppingBag",
    description: "Paket outfit lengkap dengan harga spesial",
    image: "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&h=1000&fit=crop",
    subcategories: [
      "Outfit Formal Bigsize",
      "Outfit Olahraga Bigsize",
      "Outfit Spesial Ramadhan",
      "Outfit Riding Bigsize"
    ]
  },
  {
    id: "aksesoris",
    name: "Aksesoris",
    slug: "aksesoris",
    icon: "Sparkles",
    description: "Pelengkap gaya untuk tampilan maksimal",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=1000&fit=crop",
    subcategories: [
      "Topi Snapback"
    ]
  }
];

export const getCategoryBySlug = (slug) => {
  return categories.find(cat => cat.slug === slug);
};

export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id);
};
