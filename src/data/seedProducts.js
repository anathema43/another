// Seed data for Firebase products collection
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const seedProducts = [
  {
    name: "Darjeeling Pickle",
    description: "Authentic spicy pickle from the hills of Darjeeling, made with traditional recipes passed down through generations.",
    price: 299,
    image: "https://res.cloudinary.com/dj4kdlwzo/image/upload/v1752940186/pickle_3_co88iu.jpg",
    quantityAvailable: 10,
    inventory: 10,
    rating: 4.5,
    reviewCount: 12,
    category: "pickle",
    origin: "Darjeeling, West Bengal",
    altitude: "2050m",
    artisan: "Deepak Sharma",
    cultural_tags: ["Traditional Recipe", "Handmade", "Organic"],
    featured: true,
    sku: "DJP001",
    weight: "250g",
    ingredients: ["Green chilies", "Mustard oil", "Spices", "Salt"],
    nutritionalInfo: {
      calories: 45,
      fat: 3.2,
      carbs: 4.1,
      protein: 1.8
    },
    storageInstructions: "Store in a cool, dry place. Refrigerate after opening.",
    shelfLife: "12 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Himalayan Wild Honey",
    description: "Pure organic honey from the high-altitude forests of the Himalayas, collected by local beekeepers using traditional methods.",
    price: 499,
    image: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 7,
    inventory: 7,
    rating: 5,
    reviewCount: 8,
    category: "honey",
    origin: "Manali, Himachal Pradesh",
    altitude: "3200m",
    artisan: "Laxmi Devi",
    artisanId: "laxmi-devi-001", // This will be updated after artisan seeding
    cultural_tags: ["Wild Harvested", "Raw Honey", "High Altitude"],
    featured: true,
    sku: "HWH001",
    weight: "500g",
    ingredients: ["100% Pure Wild Honey"],
    nutritionalInfo: {
      calories: 304,
      fat: 0,
      carbs: 82.4,
      protein: 0.3
    },
    storageInstructions: "Store at room temperature. Do not refrigerate.",
    shelfLife: "24 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Organic Red Rice",
    description: "Nutrient-rich, farm to table red rice from Himalayan valleys, grown without chemicals in terraced fields.",
    price: 450,
    image: "https://images.pexels.com/photos/33239/wheat-field-wheat-cereals-grain.jpg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 15,
    inventory: 15,
    rating: 4.8,
    reviewCount: 15,
    category: "grains",
    origin: "Uttarakhand Hills",
    altitude: "1800m",
    artisan: "Ashok Singh",
    cultural_tags: ["Organic Certified", "Ancient Variety", "Terraced Farming"],
    featured: true,
    sku: "ORR001",
    weight: "1kg",
    ingredients: ["100% Organic Red Rice"],
    nutritionalInfo: {
      calories: 405,
      fat: 2.2,
      carbs: 86,
      protein: 7.9
    },
    storageInstructions: "Store in airtight container in cool, dry place.",
    shelfLife: "18 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Himalayan Buckwheat",
    description: "Gluten-free, sustainably harvested buckwheat from high altitudes, perfect for traditional pancakes and porridge.",
    price: 380,
    image: "https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 12,
    inventory: 12,
    rating: 4.6,
    reviewCount: 9,
    category: "grains",
    origin: "Spiti Valley, Himachal Pradesh",
    altitude: "4200m",
    artisan: "Tenzin Norbu",
    cultural_tags: ["High Altitude", "Gluten Free", "Traditional Crop"],
    featured: false,
    sku: "HBW001",
    weight: "500g",
    ingredients: ["100% Organic Buckwheat"],
    nutritionalInfo: {
      calories: 343,
      fat: 3.4,
      carbs: 71.5,
      protein: 13.3
    },
    storageInstructions: "Store in airtight container away from moisture.",
    shelfLife: "12 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Mountain Spice Mix",
    description: "Traditional blend of Himalayan spices including cardamom, cinnamon, and cloves for authentic mountain flavors.",
    price: 250,
    image: "https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 20,
    inventory: 20,
    rating: 4.7,
    reviewCount: 18,
    category: "spices",
    origin: "Kashmir Valley",
    altitude: "1600m",
    artisan: "Fatima Khan",
    cultural_tags: ["Traditional Blend", "Hand Ground", "Aromatic"],
    featured: false,
    sku: "MSM001",
    weight: "100g",
    ingredients: ["Cardamom", "Cinnamon", "Cloves", "Black Pepper", "Nutmeg"],
    nutritionalInfo: {
      calories: 263,
      fat: 6.8,
      carbs: 65.8,
      protein: 10.6
    },
    storageInstructions: "Store in airtight container away from light and heat.",
    shelfLife: "24 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Wild Forest Honey",
    description: "Raw, unprocessed honey collected from wild forest hives in the deep Himalayan forests.",
    price: 650,
    image: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 8,
    inventory: 8,
    rating: 4.9,
    reviewCount: 6,
    category: "honey",
    origin: "Garhwal Himalayas",
    altitude: "2800m",
    artisan: "Ram Prasad",
    artisanId: "ram-prasad-001", // This will be updated after artisan seeding
    cultural_tags: ["Wild Harvested", "Unprocessed", "Forest Honey"],
    featured: false,
    sku: "WFH001",
    weight: "500g",
    ingredients: ["100% Pure Wild Forest Honey"],
    nutritionalInfo: {
      calories: 304,
      fat: 0,
      carbs: 82.4,
      protein: 0.3
    },
    storageInstructions: "Store at room temperature. Crystallization is natural.",
    shelfLife: "36 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Himalayan Black Salt",
    description: "Authentic kala namak from the mineral-rich deposits of the Himalayas, prized for its unique flavor and health benefits.",
    price: 180,
    image: "https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 25,
    inventory: 25,
    rating: 4.4,
    reviewCount: 22,
    category: "spices",
    origin: "Sambhar Lake Region",
    altitude: "400m",
    artisan: "Mohan Lal",
    cultural_tags: ["Mineral Rich", "Ayurvedic", "Traditional Mining"],
    featured: false,
    sku: "HBS001",
    weight: "200g",
    ingredients: ["100% Natural Black Salt"],
    nutritionalInfo: {
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      sodium: 38758
    },
    storageInstructions: "Store in dry place. Keep container tightly closed.",
    shelfLife: "Indefinite",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Yak Cheese (Churpi)",
    description: "Traditional hard cheese made from yak milk in the high Himalayas, a protein-rich delicacy and natural dog treat.",
    price: 320,
    image: "https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=800",
    quantityAvailable: 6,
    inventory: 6,
    rating: 4.3,
    reviewCount: 4,
    category: "dairy",
    origin: "Ladakh",
    altitude: "4500m",
    artisan: "Dolma Angmo",
    cultural_tags: ["Yak Milk", "High Altitude", "Traditional Process"],
    featured: false,
    sku: "YCC001",
    weight: "100g",
    ingredients: ["100% Yak Milk", "Salt", "Natural Enzymes"],
    nutritionalInfo: {
      calories: 380,
      fat: 1.5,
      carbs: 5,
      protein: 85
    },
    storageInstructions: "Store in cool, dry place. Can be frozen for longer storage.",
    shelfLife: "6 months",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const seedProductsToFirestore = async () => {
  try {
    console.log("Starting product seeding...");
    
    // Clear existing products (optional - remove in production)
    const existingProducts = await getDocs(collection(db, "products"));
    const deletePromises = existingProducts.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log("Cleared existing products");

    // Add seed products
    const addPromises = seedProducts.map(product => 
      addDoc(collection(db, "products"), product)
    );
    
    const results = await Promise.all(addPromises);
    console.log(`Successfully seeded ${results.length} products to Firestore`);
    
    return results;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
};

export default seedProducts;