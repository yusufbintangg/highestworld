export const products = [
  // ATASAN - Kaos & T-Shirt
  {
    id: "HG001",
    slug: "kaos-oversize-premium-phantom-black",
    name: "Baju Qurta — navy blue",
    category: "atasan",
    subcategory: "Oversize T-Shirt",
    price: 185000,
    originalPrice: 250000,
    colors: [
      { name: "Phantom Black", hex: "#1A1A1A", available: true },
      { name: "Arctic White", hex: "#F0EDE8", available: true },
      { name: "Stone Gray", hex: "#6B7280", available: false }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=1000&fit=crop"
    ],
    description: "Kaos oversize premium dengan bahan cotton combed 30s berkualitas tinggi. Desain minimalis dengan cutting modern yang cocok untuk berbagai gaya. Nyaman dipakai seharian dengan breathability maksimal.",
    material: "Cotton Combed 30s, 180gsm",
    weight: "300g",
    isNew: true,
    isBestSeller: true,
    isOnSale: true,
    stock: 45,
    rating: 4.8,
    reviewCount: 127,
    tags: ["oversize", "kaos", "premium", "bigsize"]
  },
  {
    id: "HGP002",
    slug: "polo-shirt-executive-navy",
    name: "Polo Shirt Executive — Navy Blue",
    category: "atasan",
    subcategory: "Polo Shirt",
    price: 220000,
    originalPrice: null,
    colors: [
      { name: "Navy Blue", hex: "#1E3A8A", available: true },
      { name: "Forest Green", hex: "#166534", available: true },
      { name: "Burgundy", hex: "#7C2D12", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL"],
    images: [
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=1000&fit=crop"
    ],
    description: "Polo shirt dengan potongan executive fit yang elegan. Material pique cotton yang breathable dan tidak mudah kusut. Perfect untuk acara formal maupun casual.",
    material: "Pique Cotton, 200gsm",
    weight: "350g",
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    stock: 32,
    rating: 4.7,
    reviewCount: 89,
    tags: ["polo", "formal", "executive"]
  },
  {
    id: "HKP003",
    slug: "kemeja-flanel-mountain-black",
    name: "Kemeja Flanel Mountain — Black Watch",
    category: "atasan",
    subcategory: "Kemeja Flanel",
    price: 275000,
    originalPrice: 350000,
    colors: [
      { name: "Black Watch", hex: "#0F172A", available: true },
      { name: "Red Plaid", hex: "#991B1B", available: true },
      { name: "Blue Tartan", hex: "#1E40AF", available: false }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["3XL", "4XL", "5XL", "6XL"],
    images: [
      "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=1000&fit=crop"
    ],
    description: "Kemeja flanel premium dengan motif kotak klasik. Bahan brushed cotton yang lembut dan hangat. Ideal untuk gaya rugged casual yang maskulin.",
    material: "Brushed Cotton Flannel",
    weight: "400g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 28,
    rating: 4.9,
    reviewCount: 56,
    tags: ["kemeja", "flanel", "casual"]
  },
  {
    id: "HJS004",
    slug: "jersey-futsal-premium-black",
    name: "Jersey Futsal Premium — Stealth Black",
    category: "atasan",
    subcategory: "Jersey Bigsize",
    price: 165000,
    originalPrice: null,
    colors: [
      { name: "Stealth Black", hex: "#18181B", available: true },
      { name: "Electric Blue", hex: "#0EA5E9", available: true },
      { name: "Solar Red", hex: "#DC2626", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    images: [
      "https://images.unsplash.com/photo-1551854716-8be9b2560c0a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=1000&fit=crop"
    ],
    description: "Jersey olahraga dengan teknologi dry-fit yang menyerap keringat. Material lightweight dan breathable untuk performa maksimal.",
    material: "Polyester Dry-Fit",
    weight: "200g",
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    stock: 67,
    rating: 4.6,
    reviewCount: 143,
    tags: ["jersey", "olahraga", "futsal"]
  },

  // BAWAHAN
  {
    id: "HCG005",
    slug: "celana-cargo-tactical-black",
    name: "Celana Cargo Tactical — Shadow Black",
    category: "bawahan",
    subcategory: "Cargo Pendek",
    price: 245000,
    originalPrice: 320000,
    colors: [
      { name: "Shadow Black", hex: "#171717", available: true },
      { name: "Olive Drab", hex: "#4D7C0F", available: true },
      { name: "Desert Tan", hex: "#A16207", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["38", "40", "42", "44", "46"],
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop"
    ],
    description: "Celana cargo pendek dengan banyak kantong fungsional. Bahan ripstop yang kuat dan tahan lama. Perfect untuk aktivitas outdoor.",
    material: "Cotton Ripstop",
    weight: "450g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 38,
    rating: 4.8,
    reviewCount: 102,
    tags: ["cargo", "tactical", "outdoor"]
  },
  {
    id: "HCG006",
    slug: "chinos-pendek-premium-khaki",
    name: "Chinos Pendek Premium — Desert Khaki",
    category: "bawahan",
    subcategory: "Chinos Pendek",
    price: 215000,
    originalPrice: null,
    colors: [
      { name: "Desert Khaki", hex: "#92400E", available: true },
      { name: "Navy", hex: "#1E3A8A", available: true },
      { name: "Charcoal", hex: "#374151", available: false }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["36", "38", "40", "42", "44", "46"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop"
    ],
    description: "Celana chinos pendek dengan cutting slim fit yang stylish. Material twill yang lembut dan nyaman. Cocok untuk smart casual look.",
    material: "Cotton Twill",
    weight: "380g",
    isNew: true,
    isBestSeller: false,
    isOnSale: false,
    stock: 42,
    rating: 4.7,
    reviewCount: 76,
    tags: ["chinos", "casual", "smart casual"]
  },
  {
    id: "HCD007",
    slug: "jeans-pendek-denim-dark-indigo",
    name: "Jeans Pendek Denim — Dark Indigo",
    category: "bawahan",
    subcategory: "Jeans Pendek",
    price: 265000,
    originalPrice: 340000,
    colors: [
      { name: "Dark Indigo", hex: "#1E3A8A", available: true },
      { name: "Black Denim", hex: "#18181B", available: true },
      { name: "Light Wash", hex: "#60A5FA", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["38", "40", "42", "44", "46", "48"],
    images: [
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=1000&fit=crop"
    ],
    description: "Celana jeans pendek premium dengan denim berkualitas tinggi. Fit yang sempurna dengan stretch yang nyaman untuk aktivitas harian.",
    material: "Stretch Denim 98% Cotton 2% Spandex",
    weight: "500g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 29,
    rating: 4.9,
    reviewCount: 134,
    tags: ["jeans", "denim", "casual"]
  },
  {
    id: "HGSP008",
    slug: "sweatpants-jogger-gray",
    name: "Sweatpants Jogger — Storm Gray",
    category: "bawahan",
    subcategory: "Sweatpants",
    price: 195000,
    originalPrice: null,
    colors: [
      { name: "Storm Gray", hex: "#6B7280", available: true },
      { name: "Jet Black", hex: "#18181B", available: true },
      { name: "Navy", hex: "#1E3A8A", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop"
    ],
    description: "Celana jogger dengan bahan fleece yang lembut dan hangat. Elastic waistband dengan drawstring untuk kenyamanan maksimal.",
    material: "Cotton Fleece 280gsm",
    weight: "420g",
    isNew: true,
    isBestSeller: true,
    isOnSale: false,
    stock: 55,
    rating: 4.8,
    reviewCount: 98,
    tags: ["jogger", "sweatpants", "casual"]
  },

  // JAKET & OUTER
  {
    id: "HMV009",
    slug: "jaket-bomber-premium-black",
    name: "Jaket Bomber Premium — Midnight Black",
    category: "jaket",
    subcategory: "Jaket Jumbo",
    price: 425000,
    originalPrice: 550000,
    colors: [
      { name: "Midnight Black", hex: "#0F172A", available: true },
      { name: "Olive Green", hex: "#365314", available: true },
      { name: "Maroon", hex: "#7C2D12", available: false }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL"],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop"
    ],
    description: "Jaket bomber dengan design klasik yang timeless. Material polyester premium dengan lining yang halus. Zipper berkualitas tinggi dan pocket detail.",
    material: "Polyester Premium, Satin Lining",
    weight: "600g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 22,
    rating: 4.9,
    reviewCount: 67,
    tags: ["bomber", "jaket", "premium"]
  },
  {
    id: "HWB010",
    slug: "windbreaker-tech-navy",
    name: "Windbreaker Tech — Tech Navy",
    category: "jaket",
    subcategory: "Windbreaker Big Size",
    price: 385000,
    originalPrice: null,
    colors: [
      { name: "Tech Navy", hex: "#1E3A8A", available: true },
      { name: "Stealth Black", hex: "#18181B", available: true },
      { name: "Gray", hex: "#4B5563", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    images: [
      "https://images.unsplash.com/photo-1544923246-77ad6c0b06e9?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop"
    ],
    description: "Windbreaker dengan teknologi water-resistant. Lightweight dan packable, cocok untuk traveling. Hood dengan drawstring adjustment.",
    material: "Nylon Ripstop Water-Resistant",
    weight: "350g",
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    stock: 41,
    rating: 4.7,
    reviewCount: 85,
    tags: ["windbreaker", "outdoor", "travel"]
  },
  {
    id: "HVR011",
    slug: "jaket-varsity-college-black",
    name: "Jaket Varsity College — Classic Black",
    category: "jaket",
    subcategory: "Sukajan & Varsity",
    price: 465000,
    originalPrice: 600000,
    colors: [
      { name: "Classic Black", hex: "#18181B", available: true },
      { name: "Navy Gold", hex: "#1E3A8A", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["3XL", "4XL", "5XL", "6XL", "7XL"],
    images: [
      "https://images.unsplash.com/photo-1548625361-91cfd9bf2cea?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop"
    ],
    description: "Jaket varsity dengan style college classic. Body wool blend dengan sleeve kulit sintetis premium. Detail logo embroidery dan striped trim.",
    material: "Wool Blend Body, Synthetic Leather Sleeves",
    weight: "750g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 18,
    rating: 4.8,
    reviewCount: 44,
    tags: ["varsity", "college", "jacket"]
  },

  // OUTFIT SET
  {
    id: "HKP012",
    slug: "outfit-formal-executive-navy",
    name: "Outfit Formal Executive Set — Navy",
    category: "outfit-set",
    subcategory: "Outfit Formal Bigsize",
    price: 575000,
    originalPrice: 850000,
    colors: [
      { name: "Navy Blue", hex: "#1E3A8A", available: true },
      { name: "Charcoal", hex: "#374151", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL"],
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop"
    ],
    description: "Paket lengkap outfit formal: kemeja lengan panjang + celana formal. Bahan premium dengan cutting executive fit. Hemat hingga 40%!",
    material: "Premium Cotton Blend",
    weight: "800g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 25,
    rating: 4.9,
    reviewCount: 72,
    tags: ["formal", "set", "executive"]
  },
  {
    id: "HJS013",
    slug: "outfit-olahraga-performance-black",
    name: "Outfit Olahraga Performance Set — Black",
    category: "outfit-set",
    subcategory: "Outfit Olahraga Bigsize",
    price: 365000,
    originalPrice: 520000,
    colors: [
      { name: "Performance Black", hex: "#18181B", available: true },
      { name: "Navy Blue", hex: "#1E3A8A", available: true },
      { name: "Gray", hex: "#6B7280", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop"
    ],
    description: "Set olahraga dengan teknologi dry-fit: jersey + celana training. Material breathable dan stretch untuk performa maksimal.",
    material: "Polyester Dry-Fit Performance",
    weight: "500g",
    isNew: true,
    isBestSeller: true,
    isOnSale: true,
    stock: 48,
    rating: 4.8,
    reviewCount: 156,
    tags: ["olahraga", "set", "performance"]
  },
  {
    id: "HQS014",
    slug: "outfit-ramadhan-premium-white",
    name: "Outfit Ramadhan Premium Set — Pure White",
    category: "outfit-set",
    subcategory: "Outfit Spesial Ramadhan",
    price: 445000,
    originalPrice: 650000,
    colors: [
      { name: "Pure White", hex: "#FAFAFA", available: true },
      { name: "Cream", hex: "#F5F5DC", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL"],
    images: [
      "https://images.unsplash.com/photo-1583846419412-cf8e8885bf35?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&h=1000&fit=crop"
    ],
    description: "Set busana muslim premium: kemeja koko + celana sirwal. Material katun premium yang adem dan nyaman. Perfect untuk ibadah dan lebaran.",
    material: "Premium Cotton",
    weight: "550g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 35,
    rating: 4.9,
    reviewCount: 88,
    tags: ["ramadhan", "muslim", "set"]
  },
  {
    id: "HVR015",
    slug: "outfit-riding-touring-black",
    name: "Outfit Riding Touring Set — Rider Black",
    category: "outfit-set",
    subcategory: "Outfit Riding Bigsize",
    price: 525000,
    originalPrice: 750000,
    colors: [
      { name: "Rider Black", hex: "#0F172A", available: true },
      { name: "Dark Gray", hex: "#374151", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["3XL", "4XL", "5XL", "6XL", "7XL"],
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1609526390817-e33511e73047?w=800&h=1000&fit=crop"
    ],
    description: "Set riding dengan protector lengkap: jaket + celana riding. Material abrasion resistant dengan padding di area vital. Safety meets style.",
    material: "Cordura Abrasion Resistant, CE Protection",
    weight: "1200g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 16,
    rating: 4.7,
    reviewCount: 52,
    tags: ["riding", "touring", "motorcycle"]
  },

  // ATASAN - Additional
  {
    id: "HKP016",
    slug: "kemeja-pendek-casual-white",
    name: "Kemeja Pendek Casual — Fresh White",
    category: "atasan",
    subcategory: "Kemeja Pendek",
    price: 195000,
    originalPrice: null,
    colors: [
      { name: "Fresh White", hex: "#FAFAFA", available: true },
      { name: "Sky Blue", hex: "#0EA5E9", available: true },
      { name: "Mint Green", hex: "#10B981", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=1000&fit=crop"
    ],
    description: "Kemeja lengan pendek dengan material linen blend yang adem. Perfect untuk cuaca tropis. Easy care dan tidak mudah kusut.",
    material: "Linen Blend",
    weight: "280g",
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    stock: 58,
    rating: 4.6,
    reviewCount: 73,
    tags: ["kemeja", "casual", "summer"]
  },
  {
    id: "HG017",
    slug: "kaos-bigsize-basic-navy",
    name: "Kaos Bigsize Basic — Navy Essential",
    category: "atasan",
    subcategory: "Kaos Bigsize",
    price: 125000,
    originalPrice: 175000,
    colors: [
      { name: "Navy Essential", hex: "#1E3A8A", available: true },
      { name: "Basic Black", hex: "#18181B", available: true },
      { name: "White", hex: "#FAFAFA", available: true },
      { name: "Gray", hex: "#6B7280", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=1000&fit=crop"
    ],
    description: "Kaos basic yang wajib ada di lemari. Bahan cotton combed premium dengan fit yang pas. Multifungsi dan tahan lama.",
    material: "Cotton Combed 24s",
    weight: "220g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 124,
    rating: 4.8,
    reviewCount: 245,
    tags: ["kaos", "basic", "essential"]
  },

  // BAWAHAN - Additional
  {
    id: "HCGP018",
    slug: "celana-panjang-formal-charcoal",
    name: "Celana Panjang Formal — Charcoal Gray",
    category: "bawahan",
    subcategory: "Celana Panjang Jumbo",
    price: 285000,
    originalPrice: null,
    colors: [
      { name: "Charcoal Gray", hex: "#374151", available: true },
      { name: "Navy", hex: "#1E3A8A", available: true },
      { name: "Black", hex: "#18181B", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["38", "40", "42", "44", "46", "48", "50"],
    images: [
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop"
    ],
    description: "Celana formal dengan bahan wool blend premium. Cutting slim fit modern dengan kenyamanan maksimal. Wrinkle-free untuk kemudahan perawatan.",
    material: "Wool Blend Premium",
    weight: "450g",
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    stock: 37,
    rating: 4.7,
    reviewCount: 91,
    tags: ["formal", "celana panjang", "office"]
  },
  {
    id: "HGR019",
    slug: "running-pants-sport-black",
    name: "Running Pants Sport — Stealth Black",
    category: "bawahan",
    subcategory: "Running Pants",
    price: 175000,
    originalPrice: 240000,
    colors: [
      { name: "Stealth Black", hex: "#18181B", available: true },
      { name: "Navy", hex: "#1E3A8A", available: true },
      { name: "Gray", hex: "#6B7280", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop"
    ],
    description: "Celana running dengan material quick-dry dan stretch. Zipper pocket untuk menyimpan barang. Reflective detail untuk visibility di malam hari.",
    material: "Polyester Stretch Quick-Dry",
    weight: "280g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 62,
    rating: 4.7,
    reviewCount: 108,
    tags: ["running", "sport", "activewear"]
  },
  {
    id: "HBX020",
    slug: "boxer-premium-multicolor",
    name: "Boxer Premium Pack — Multi Color",
    category: "bawahan",
    subcategory: "Boxer Bigsize",
    price: 145000,
    originalPrice: null,
    colors: [
      { name: "Multi Pack", hex: "#6B7280", available: true }
    ],
    sizes: ["36", "38", "40", "42", "44", "46", "48", "50"],
    availableSizes: ["38", "40", "42", "44", "46", "48"],
    images: [
      "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1603217036-f2b0ffde923c?w=800&h=1000&fit=crop"
    ],
    description: "Paket isi 3 boxer dengan bahan cotton stretch premium. Elastic waistband yang awet dan nyaman. Breathable dan anti-bacterial treatment.",
    material: "Cotton Stretch with Spandex",
    weight: "150g",
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    stock: 95,
    rating: 4.9,
    reviewCount: 187,
    tags: ["boxer", "underwear", "pack"]
  },

  // AKSESORIS
  {
    id: "HGHT021",
    slug: "topi-snapback-premium-black",
    name: "Topi Snapback Premium — Urban Black",
    category: "aksesoris",
    subcategory: "Topi Snapback",
    price: 115000,
    originalPrice: 165000,
    colors: [
      { name: "Urban Black", hex: "#18181B", available: true },
      { name: "Navy", hex: "#1E3A8A", available: true },
      { name: "White", hex: "#FAFAFA", available: true }
    ],
    sizes: ["Free Size"],
    availableSizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&h=1000&fit=crop"
    ],
    description: "Topi snapback dengan embroidery logo premium. Adjustable snapback closure untuk fit yang pas. Material twill yang awet dan strukturnya terjaga.",
    material: "Cotton Twill",
    weight: "120g",
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    stock: 78,
    rating: 4.8,
    reviewCount: 142,
    tags: ["topi", "snapback", "aksesoris"]
  },

  // JAKET - Additional
  {
    id: "HB022",
    slug: "jaket-baseball-classic-black",
    name: "Jaket Baseball Classic — Heritage Black",
    category: "jaket",
    subcategory: "Jaket Baseball",
    price: 395000,
    originalPrice: 520000,
    colors: [
      { name: "Heritage Black", hex: "#18181B", available: true },
      { name: "Navy White", hex: "#1E3A8A", available: true }
    ],
    sizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"],
    availableSizes: ["2XL", "3XL", "4XL", "5XL", "6XL", "7XL"],
    images: [
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop"
    ],
    description: "Jaket baseball dengan style retro yang timeless. Material premium dengan button closure. Ribbed collar, cuffs dan hem untuk fit yang sempurna.",
    material: "Premium Cotton Twill",
    weight: "650g",
    isNew: true,
    isBestSeller: false,
    isOnSale: true,
    stock: 24,
    rating: 4.8,
    reviewCount: 58,
    tags: ["baseball", "jacket", "retro"]
  }
];

// Utility functions
export const getProductBySlug = (slug) => {
  return products.find(p => p.slug === slug);
};

export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category) => {
  return products.filter(p => p.category === category);
};

export const getProductsBySubcategory = (subcategory) => {
  return products.filter(p => p.subcategory === subcategory);
};

export const getFeaturedProducts = (limit = 8) => {
  return products.filter(p => p.isBestSeller || p.isNew).slice(0, limit);
};

export const getNewProducts = (limit = 8) => {
  return products.filter(p => p.isNew).slice(0, limit);
};

export const getBestSellers = (limit = 8) => {
  return products.filter(p => p.isBestSeller).slice(0, limit);
};

export const getOnSaleProducts = (limit = 8) => {
  return products.filter(p => p.isOnSale).slice(0, limit);
};
