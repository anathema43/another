// Seed data for Firebase artisans collection
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const seedArtisans = [
  {
    name: "Deepak Sharma",
    title: "Master Pickle Maker",
    location: "Darjeeling, West Bengal",
    region: "West Bengal",
    experience: 25,
    profileImage: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Third-generation pickle maker specializing in traditional Darjeeling recipes passed down through his family.",
    story: `Deepak Sharma learned the art of pickle making from his grandmother, who taught him the secret blend of spices that makes Darjeeling pickles unique. Growing up in the misty hills of Darjeeling, he witnessed how each season brought different vegetables and fruits that could be preserved using ancient techniques.

His family has been making pickles for over 75 years, and Deepak has perfected the recipes while maintaining the traditional methods. He sources all his ingredients from local farmers in the Darjeeling hills, ensuring that every jar tells the story of the mountains.

Today, Deepak employs 8 local women in his small workshop, providing them with steady income while preserving the traditional knowledge of pickle making. His pickles are made in small batches, ensuring quality and authenticity in every jar.`,
    specialties: ["Traditional Pickle Making", "Darjeeling Recipes", "Spice Blending"],
    techniques: [
      "Hand-grinding of spices",
      "Preserving family recipes",
      "Supporting local farmers",
      "Sustainable practices",
      "Quality over quantity"
    ],
    values: [
      "Traditional methods",
      "Family recipes",
      "Local sourcing",
      "Women empowerment",
      "Quality craftsmanship"
    ],
    culturalHeritage: "Darjeeling pickle making tradition",
    familyMembers: 6,
    rating: 4.8,
    reviewCount: 24,
    featured: true,
    productCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Laxmi Devi",
    title: "Wild Honey Collector",
    location: "Manali, Himachal Pradesh",
    region: "Himachal Pradesh",
    experience: 18,
    profileImage: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Expert honey collector who harvests wild honey from high-altitude forests using traditional sustainable methods.",
    story: `Laxmi Devi comes from a family of traditional honey collectors in the high mountains of Himachal Pradesh. She learned the ancient art of wild honey collection from her father, who taught her to read the mountains and understand the behavior of wild bees.

At altitudes of over 3000 meters, Laxmi carefully harvests honey from wild bee colonies, using smoke and traditional tools that have been used for centuries. She follows strict sustainable practices, never taking more than the bees can spare, ensuring the colonies remain healthy.

Her honey is completely raw and unprocessed, containing all the natural enzymes and nutrients that make Himalayan honey so special. Each batch reflects the unique flora of the high-altitude forests where the bees collect nectar.

Laxmi has trained 5 other women in her village in sustainable honey collection, creating a small cooperative that provides income while protecting the mountain ecosystem.`,
    specialties: ["Wild Honey Collection", "Sustainable Harvesting", "High-Altitude Foraging"],
    techniques: [
      "Traditional smoking methods",
      "Sustainable harvesting practices",
      "Natural comb extraction",
      "Raw honey preservation"
    ],
    values: [
      "Environmental conservation",
      "Sustainable harvesting",
      "Community cooperation",
      "Natural purity"
    ],
    culturalHeritage: "Himalayan honey collection traditions",
    familyMembers: 4,
    rating: 4.9,
    reviewCount: 18,
    featured: true,
    productCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Ashok Singh",
    title: "Organic Rice Farmer",
    location: "Uttarakhand Hills",
    region: "Uttarakhand",
    experience: 22,
    profileImage: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Dedicated organic farmer growing ancient varieties of red rice in terraced fields using traditional methods.",
    story: `Ashok Singh is a passionate advocate for organic farming and the preservation of ancient rice varieties. His family has been farming in the terraced fields of Uttarakhand for generations, and he has dedicated his life to maintaining these traditional practices.

He grows several heritage varieties of red rice that are native to the Himalayan region. These varieties are naturally resistant to pests and diseases, requiring no chemical inputs. The terraced fields, carved into the mountainside by his ancestors, use an ingenious water management system that has sustained agriculture for centuries.

Ashok's rice is grown at altitudes between 1500-2000 meters, where the cool mountain air and pure water from glacial streams create ideal growing conditions. The rice is harvested by hand and processed using traditional methods that preserve its nutritional value.

Through his work, Ashok supports 12 farming families in his village, teaching them organic methods and helping them transition away from chemical farming. His cooperative has become a model for sustainable agriculture in the region.`,
    specialties: ["Organic Farming", "Heritage Rice Varieties", "Terraced Agriculture"],
    techniques: [
      "Terraced field cultivation",
      "Natural pest management",
      "Traditional seed preservation",
      "Hand harvesting methods"
    ],
    values: [
      "Organic farming principles",
      "Biodiversity conservation",
      "Soil health preservation",
      "Community education"
    ],
    culturalHeritage: "Himalayan terraced farming traditions",
    familyMembers: 5,
    rating: 4.7,
    reviewCount: 31,
    featured: true,
    productCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Tenzin Norbu",
    title: "Buckwheat Cultivator",
    location: "Spiti Valley, Himachal Pradesh",
    region: "Himachal Pradesh",
    experience: 15,
    profileImage: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "High-altitude farmer specializing in buckwheat cultivation in the harsh but pristine environment of Spiti Valley.",
    story: `Tenzin Norbu farms in one of the most challenging environments on Earth - the high-altitude desert of Spiti Valley at over 4000 meters above sea level. Here, where the growing season is just 4 months long, he cultivates buckwheat using methods passed down through Tibetan Buddhist traditions.

The extreme conditions of Spiti - intense sunlight, freezing nights, and minimal rainfall - create buckwheat with exceptional nutritional density. Tenzin's buckwheat is completely organic by necessity, as the harsh environment naturally protects against pests.

Following Buddhist principles of harmony with nature, Tenzin practices sustainable farming that works with the natural cycles of the high mountains. His buckwheat is hand-planted, hand-weeded, and hand-harvested, ensuring minimal impact on the fragile mountain ecosystem.

Tenzin is also a cultural bridge, helping to preserve Tibetan farming traditions while adapting to modern market needs. His work supports 8 families in his remote village, providing them with income from their traditional crops.`,
    specialties: ["High-Altitude Farming", "Buckwheat Cultivation", "Tibetan Agriculture"],
    techniques: [
      "High-altitude cultivation",
      "Traditional Tibetan methods",
      "Natural crop rotation",
      "Hand processing techniques"
    ],
    values: [
      "Buddhist farming principles",
      "Environmental harmony",
      "Cultural preservation",
      "Community resilience"
    ],
    culturalHeritage: "Tibetan Buddhist farming traditions",
    familyMembers: 3,
    rating: 4.6,
    reviewCount: 12,
    featured: false,
    productCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Fatima Khan",
    title: "Spice Master",
    location: "Kashmir Valley",
    region: "Kashmir",
    experience: 30,
    profileImage: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Master spice blender creating traditional Kashmiri spice mixes using recipes perfected over three decades.",
    story: `Fatima Khan is renowned throughout Kashmir for her exceptional spice blends that capture the essence of Kashmiri cuisine. She learned the art of spice blending from her mother-in-law, who was famous in their village for her mastery of traditional recipes.

Working from her home in the Kashmir Valley, Fatima hand-selects each spice, often traveling to different regions to source the finest cardamom, saffron, and other precious spices. She roasts and grinds everything by hand in small batches, ensuring that each blend maintains its aromatic potency.

Her spice mixes are used in traditional Kashmiri dishes and have been refined through years of experimentation and feedback from local families. Each blend tells the story of Kashmir's rich culinary heritage and the complex flavors that define the region's cuisine.

Fatima has trained 6 women in her neighborhood in the art of spice blending, creating a small enterprise that provides income while preserving traditional knowledge. Her workshop has become a gathering place where recipes and stories are shared.`,
    specialties: ["Spice Blending", "Kashmiri Cuisine", "Traditional Recipes"],
    techniques: [
      "Hand-roasting of spices",
      "Traditional grinding methods",
      "Flavor balancing techniques",
      "Aromatic preservation"
    ],
    values: [
      "Culinary tradition preservation",
      "Quality ingredients sourcing",
      "Women's empowerment",
      "Cultural recipe sharing"
    ],
    culturalHeritage: "Kashmiri culinary traditions",
    familyMembers: 7,
    rating: 4.8,
    reviewCount: 27,
    featured: false,
    productCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Ram Prasad",
    title: "Forest Honey Guardian",
    location: "Garhwal Himalayas",
    region: "Uttarakhand",
    experience: 20,
    profileImage: "https://images.pexels.com/photos/1181562/pexels-photo-1181562.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Forest guardian and honey collector protecting wild bee colonies while sustainably harvesting forest honey.",
    story: `Ram Prasad serves as both a forest guardian and honey collector in the dense forests of the Garhwal Himalayas. His role goes beyond honey collection - he is a protector of the forest ecosystem and the wild bee colonies that call it home.

Having spent two decades in the forests, Ram has developed an intimate knowledge of bee behavior and forest ecology. He can identify different types of wild bees and knows exactly when and how much honey can be sustainably harvested without harming the colonies.

His honey comes from bees that forage on a diverse range of wild flowers, herbs, and trees found only in the pristine Himalayan forests. This creates honey with complex flavors and exceptional medicinal properties that cannot be replicated in managed apiaries.

Ram works with the local forest department to protect bee habitats and has trained 4 other forest workers in sustainable honey collection. His efforts have helped establish protected zones for wild bee colonies while providing sustainable income for forest communities.`,
    specialties: ["Forest Conservation", "Wild Honey", "Ecosystem Protection"],
    techniques: [
      "Wild colony identification",
      "Sustainable extraction methods",
      "Forest ecosystem management",
      "Natural honey preservation"
    ],
    values: [
      "Forest conservation",
      "Wildlife protection",
      "Sustainable harvesting",
      "Ecosystem balance"
    ],
    culturalHeritage: "Himalayan forest traditions",
    familyMembers: 4,
    rating: 4.9,
    reviewCount: 15,
    featured: false,
    productCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Mohan Lal",
    title: "Black Salt Miner",
    location: "Sambhar Lake Region",
    region: "Rajasthan",
    experience: 28,
    profileImage: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Traditional black salt miner extracting mineral-rich kala namak using methods passed down through generations.",
    story: `Mohan Lal comes from a family that has been mining black salt (kala namak) for over 100 years. The traditional mining techniques he uses have been passed down through four generations, preserving both the quality of the salt and the ancient knowledge.

Working in the mineral-rich deposits near Sambhar Lake, Mohan extracts black salt using traditional methods that maintain its unique sulfur content and distinctive flavor. The process requires precise timing and temperature control that can only be mastered through years of experience.

His black salt is prized by chefs and home cooks across India for its unique taste and digestive properties. Unlike industrial salt, Mohan's kala namak retains all its natural minerals and therapeutic qualities.

Mohan has established a small cooperative with 8 other traditional miners, ensuring that this ancient craft continues while providing fair wages for the skilled work involved.`,
    specialties: ["Traditional Mining", "Mineral Extraction", "Salt Processing"],
    techniques: [
      "Traditional mining methods",
      "Temperature-controlled processing",
      "Natural mineral preservation",
      "Quality testing techniques"
    ],
    values: [
      "Traditional knowledge preservation",
      "Quality over quantity",
      "Sustainable extraction",
      "Community cooperation"
    ],
    culturalHeritage: "Traditional salt mining heritage",
    familyMembers: 6,
    rating: 4.4,
    reviewCount: 22,
    featured: false,
    productCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Dolma Angmo",
    title: "Yak Cheese Maker",
    location: "Ladakh",
    region: "Ladakh",
    experience: 16,
    profileImage: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "High-altitude yak cheese maker creating traditional churpi using ancient Ladakhi methods in the world's highest inhabited region.",
    story: `Dolma Angmo lives and works at 4500 meters above sea level in Ladakh, where she makes traditional yak cheese (churpi) using methods that have sustained her community for centuries. In this harsh but beautiful landscape, yaks are not just livestock - they are partners in survival.

The process of making churpi is both an art and a necessity. The cheese must be made quickly in the short summer months when the yaks produce milk, and it must be processed to last through the long, harsh winters.

Dolma learned this craft from her grandmother, who taught her the precise timing needed to separate the curds, the right pressure for pressing, and the optimal drying conditions that create churpi's characteristic hardness and long shelf life.

Her churpi is not only a traditional food but also serves as a natural, long-lasting treat that has gained popularity among dog owners worldwide. This unexpected market has provided new income opportunities for her remote community.

Through her work, Dolma supports 5 families in her village, helping them maintain their traditional lifestyle while adapting to modern economic opportunities.`,
    specialties: ["Yak Cheese Making", "High-Altitude Processing", "Traditional Preservation"],
    techniques: [
      "Traditional milk processing",
      "Natural cheese aging",
      "High-altitude drying methods",
      "Quality preservation techniques"
    ],
    values: [
      "Traditional Ladakhi methods",
      "Sustainable yak farming",
      "Community resilience",
      "Cultural adaptation"
    ],
    culturalHeritage: "Ladakhi yak farming and cheese-making traditions",
    familyMembers: 5,
    rating: 4.3,
    reviewCount: 8,
    featured: false,
    productCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Additional artisans for more variety
const additionalArtisans = [
  {
    name: "Karma Lama",
    title: "Traditional Tea Master",
    location: "Darjeeling Tea Gardens",
    region: "West Bengal",
    experience: 35,
    profileImage: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "Fourth-generation tea master overseeing traditional Darjeeling tea production with expertise in orthodox tea processing.",
    story: `Karma Lama represents the fourth generation of his family to work in the Darjeeling tea gardens. His great-grandfather started as a tea plucker in the British era, and the family has been involved in tea production ever since.

Working at the historic Makaibari Tea Estate, Karma oversees the traditional orthodox tea processing that gives Darjeeling tea its distinctive muscatel flavor. He understands the subtle art of withering, rolling, oxidation, and firing that transforms fresh tea leaves into the world-renowned Darjeeling tea.

His expertise extends beyond processing to understanding the terroir - how altitude, soil, weather, and timing affect the final cup. He can identify the flush (harvest season) and even the specific garden of a tea just by tasting.

Karma trains young tea workers in traditional methods while adapting to organic and biodynamic practices that are increasingly important for premium tea markets. His work ensures that Darjeeling tea maintains its reputation as the "Champagne of Teas."`,
    specialties: ["Orthodox Tea Processing", "Tea Tasting", "Garden Management"],
    techniques: [
      "Traditional withering methods",
      "Hand-rolling techniques", 
      "Oxidation control",
      "Firing and drying expertise"
    ],
    values: [
      "Tea quality excellence",
      "Traditional processing methods",
      "Sustainable tea farming",
      "Knowledge transfer to youth"
    ],
    culturalHeritage: "Darjeeling tea garden traditions",
    familyMembers: 8,
    rating: 4.9,
    reviewCount: 45,
    featured: false,
    productCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: "Pemba Sherpa",
    title: "Himalayan Herb Collector",
    location: "Everest Region, Nepal",
    region: "Nepal",
    experience: 12,
    profileImage: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800",
    shortBio: "High-altitude herb collector specializing in medicinal plants found only in the Everest region above 4000 meters.",
    story: `Pemba Sherpa combines his mountaineering skills with traditional knowledge of Himalayan medicinal plants. Growing up in the Everest region, he learned from village elders about the healing properties of high-altitude herbs.

At altitudes where few plants can survive, Pemba collects rare herbs like Cordyceps, Himalayan Rhubarb, and Snow Lotus that have been used in traditional medicine for centuries. His collection work requires both physical endurance and deep botanical knowledge.

Each herb is collected at the optimal time - some during specific moon phases, others at particular times of day when their medicinal properties are strongest. Pemba follows strict sustainable practices, never over-harvesting and always leaving enough for natural regeneration.

His work provides income for his family while preserving traditional knowledge about Himalayan medicinal plants. He has documented over 50 different herbs and their traditional uses, creating a valuable resource for future generations.`,
    specialties: ["Medicinal Herb Collection", "High-Altitude Botany", "Traditional Medicine"],
    techniques: [
      "Sustainable wild harvesting",
      "Optimal timing collection",
      "Traditional drying methods",
      "Medicinal preparation techniques"
    ],
    values: [
      "Traditional medicine preservation",
      "Sustainable harvesting",
      "Knowledge documentation",
      "Community health support"
    ],
    culturalHeritage: "Sherpa traditional medicine practices",
    familyMembers: 6,
    rating: 4.7,
    reviewCount: 19,
    featured: false,
    productCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Combine all artisans
const allSeedArtisans = [...seedArtisans, ...additionalArtisans];

export const seedArtisansToFirestore = async () => {
  try {
    console.log("Starting artisan seeding...");
    
    // Clear existing artisans (optional - remove in production)
    const existingArtisans = await getDocs(collection(db, "artisans"));
    const deletePromises = existingArtisans.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log("Cleared existing artisans");

    // Add seed artisans
    const addPromises = allSeedArtisans.map(artisan => 
      addDoc(collection(db, "artisans"), artisan)
    );
    
    const results = await Promise.all(addPromises);
    console.log(`Successfully seeded ${results.length} artisans to Firestore`);
    
    return results;
  } catch (error) {
    console.error("Error seeding artisans:", error);
    throw error;
  }
};
