export interface Product {
  id: string;
  category: string;
  name: string;
  status: string;
  sku: string;
  price: number;
  buyLink: string;
  image?: string;
  groupName: string;
  color?: string;
  hexColor?: string;
}

export const products: Product[] = [
  {
    "id": "o-di",
    "category": "Accessories",
    "name": "Divider",
    "status": "Removal Requested",
    "sku": "O-DI",
    "price": 8.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/divider-odi/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/O-DI.png",
    "groupName": "Divider"
  },
  {
    "id": "o-im",
    "category": "Accessories",
    "name": "Ice Molds",
    "status": "Removal Requested",
    "sku": "O-IM",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/ice-molds-oim/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/O-IM.png",
    "groupName": "Ice Molds"
  },
  {
    "id": "o-sb",
    "category": "Accessories",
    "name": "Shaker Ball",
    "status": "In Store",
    "sku": "O-SB",
    "price": 7.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/shaker-ball-osb/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/O-SB.png",
    "groupName": "Shaker Ball"
  },
  {
    "id": "o-an",
    "category": "Accessories",
    "name": "The Anchor (Snack Compartment)",
    "status": "In Store",
    "sku": "O-AN",
    "price": 12.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/the-anchor-snack-compartment-oan/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/O-AN.png",
    "groupName": "The Anchor",
    "color": "Snack Compartment"
  },
  {
    "id": "su-el-1",
    "category": "Wellness",
    "name": "Surge IV (Blue Razzberry)",
    "status": "In Store",
    "sku": "SU-EL-1",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-blue-razzberry-suel1/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-1.png",
    "groupName": "Surge IV",
    "color": "Blue Razzberry",
    "hexColor": "#0000FF"
  },
  {
    "id": "su-el-2",
    "category": "Wellness",
    "name": "Surge IV (Fruit Punch)",
    "status": "In Store",
    "sku": "SU-EL-2",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-fruit-punch-suel2/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-2.png",
    "groupName": "Surge IV",
    "color": "Fruit Punch",
    "hexColor": "#FF4500"
  },
  {
    "id": "su-el-3",
    "category": "Wellness",
    "name": "Surge IV (Lemonade)",
    "status": "In Store",
    "sku": "SU-EL-3",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-lemonade-suel3/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-3.png",
    "groupName": "Surge IV",
    "color": "Lemonade",
    "hexColor": "#FFFF00"
  },
  {
    "id": "su-el-4",
    "category": "Wellness",
    "name": "Surge IV (Pina Colada)",
    "status": "In Store",
    "sku": "SU-EL-4",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-pina-colada-suel4/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-4.png",
    "groupName": "Surge IV",
    "color": "Pina Colada",
    "hexColor": "#F0E68C"
  },
  {
    "id": "su-el-5",
    "category": "Wellness",
    "name": "Surge IV (Strawberry)",
    "status": "In Store",
    "sku": "SU-EL-5",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-strawberry-suel5/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-5.png",
    "groupName": "Surge IV",
    "color": "Strawberry",
    "hexColor": "#FF69B4"
  },
  {
    "id": "su-el-6",
    "category": "Wellness",
    "name": "Surge IV (Tropical Vibes)",
    "status": "In Store",
    "sku": "SU-EL-6",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-tropical-punch-suel6/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-6.png",
    "groupName": "Surge IV",
    "color": "Tropical Vibes",
    "hexColor": "#FF7F50"
  },
  {
    "id": "su-el-7",
    "category": "Wellness",
    "name": "Surge IV (Cucumber Lime)",
    "status": "In Store",
    "sku": "SU-EL-7",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-cucumber-lime-suel7/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-7.png",
    "groupName": "Surge IV",
    "color": "Cucumber Lime",
    "hexColor": "#90EE90"
  },
  {
    "id": "su-el-8",
    "category": "Wellness",
    "name": "Surge IV (Apple Cider)",
    "status": "In Store",
    "sku": "SU-EL-8",
    "price": 19.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/surge-iv-apple-cider-suel8/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-EL-8.png",
    "groupName": "Surge IV",
    "color": "Apple Cider",
    "hexColor": "#D2691E"
  },
  {
    "id": "ca-sc",
    "category": "Accessories",
    "name": "The Snow Cap (Modified Lid)",
    "status": "Removal Requested",
    "sku": "CA-SC",
    "price": 14.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/the-snow-cap-modified-lid-casc/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/CA-SC.png",
    "groupName": "The Snow Cap",
    "color": "Modified Lid"
  },
  {
    "id": "su-pr-1",
    "category": "Wellness",
    "name": "Peak Protein (Chocolate)",
    "status": "In Store",
    "sku": "SU-PR-1",
    "price": 34.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/peak-powder-chocolate-supr1/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-PR-1.png",
    "groupName": "Peak Protein",
    "color": "Chocolate",
    "hexColor": "#3E2723"
  },
  {
    "id": "su-pr-2",
    "category": "Wellness",
    "name": "Peak Protein (Vanilla)",
    "status": "In Store",
    "sku": "SU-PR-2",
    "price": 34.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/peak-powder-vanilla-supr2/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-PR-2.png",
    "groupName": "Peak Powder",
    "color": "Vanilla",
    "hexColor": "#F3E5AB"
  },
  {
    "id": "bo-46",
    "category": "Water Bottles",
    "name": "The Glacier (White) w. Ice Cap",
    "status": "In Store",
    "sku": "BO-46",
    "price": 75,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/the-glacier-white-w-ice-cap-bo46/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/BO-46.png",
    "groupName": "The Glacier",
    "color": "White",
    "hexColor": "#FFFFFF"
  },
  {
    "id": "bo-36",
    "category": "Water Bottles",
    "name": "The Iceberg (White) w. Ice Cap",
    "status": "In Store",
    "sku": "BO-36",
    "price": 60,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/the-iceberg-white-w-ice-cap-bo36/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/BO-36.png",
    "groupName": "The Iceberg",
    "color": "White",
    "hexColor": "#FFFFFF"
  },
  {
    "id": "se-f-1",
    "category": "Bundles",
    "name": "Alo x Thrive Bundle",
    "status": "In Store",
    "sku": "SE-F-1",
    "price": 499.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/alo-x-thrive-bundle-sef1/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SE-F-1.png",
    "groupName": "Alo x Thrive Bundle"
  },
  {
    "id": "se-f-2",
    "category": "Bundles",
    "name": "Peleton x Thrive Bundle",
    "status": "In Store",
    "sku": "SE-F-2",
    "price": 2999.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/peloton-x-thrive-bundle-sef2/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SE-F-2.png",
    "groupName": "Peleton x Thrive Bundle"
  },
  {
    "id": "se-f-3",
    "category": "Bundles",
    "name": "Fall Bundle",
    "status": "In Store",
    "sku": "SE-F-3",
    "price": 399.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/fall-bundle-sef3/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SE-F-3.png",
    "groupName": "Fall Bundle"
  },
  {
    "id": "su-pr-3",
    "category": "Wellness",
    "name": "Peak Protein (Pumpkin Spice)",
    "status": "In Store",
    "sku": "SU-PR-3",
    "price": 34.99,
    "buyLink": "https://portal.veinternational.org/buybuttons/us019814/btn/peak-protein-pumpkin-spice-supr3/",
    "image": "https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products/product-images/SU-PR-3.png",
    "groupName": "Peak Protein",
    "color": "Pumpkin Spice",
    "hexColor": "#D2691E"
  }
];

export const categories = ["All", "Wellness", "Water Bottles", "Bundles"];
