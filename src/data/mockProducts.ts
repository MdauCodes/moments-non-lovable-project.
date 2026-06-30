import type { Product } from "@/data/products";
import bagImg from "@/assets/cat-bags.jpg";
import bagShopperImg from "@/assets/pkg-carrier-bag.png";
import burgerBoxImg from "@/assets/prod-food-takeaway-set.jpg";
import giftBoxImg from "@/assets/prod-gifting-favour-box.jpg";
import hotCupImg from "@/assets/cat-cups.jpg";
import coldCupImg from "@/assets/pkg-cup.png";
import courierMailerImg from "@/assets/prod-ecommerce-courier-box.jpg";
import returnMailerImg from "@/assets/prod-ecommerce-return-mailer.jpg";

/**
 * Hardcoded fallback catalogue used by the products listing when the live API
 * is unreachable, returns 404, or otherwise can't deliver a catalogue.
 *
 * Covers 4 categories: bags, boxes, cups, mailers. Each item carries name,
 * category, price per unit (KSh), MOQ, and a real product photo from /assets.
 */

type MockSeed = {
  id: string;
  slug: string;
  name: string;
  category: "bags" | "boxes" | "cups" | "mailers";
  basePrice: number;
  moq: number;
  image: string;
};

const seeds: MockSeed[] = [
  { id: "mock-bag-1",     slug: "mock-kraft-twisted-handle-bag", name: "Kraft Twisted-Handle Paper Bag", category: "bags",    basePrice: 28,  moq: 100, image: bagImg },
  { id: "mock-bag-2",     slug: "mock-flat-handle-shopper",      name: "Flat-Handle Retail Shopper",     category: "bags",    basePrice: 35,  moq: 200, image: bagShopperImg },
  { id: "mock-box-1",     slug: "mock-burger-meal-box",          name: "Branded Burger Meal Box",        category: "boxes",   basePrice: 22,  moq: 250, image: burgerBoxImg },
  { id: "mock-box-2",     slug: "mock-rigid-gift-box",           name: "Rigid Gift Box (Magnetic Lid)",  category: "boxes",   basePrice: 180, moq: 100, image: giftBoxImg },
  { id: "mock-cup-1",     slug: "mock-double-wall-hot-cup",      name: "Double-Wall Hot Cup 8oz",        category: "cups",    basePrice: 9,   moq: 500, image: hotCupImg },
  { id: "mock-cup-2",     slug: "mock-cold-cup-pet",             name: "Clear Cold Cup 16oz",            category: "cups",    basePrice: 11,  moq: 500, image: coldCupImg },
  { id: "mock-mailer-1",  slug: "mock-kraft-courier-mailer",     name: "Kraft Courier Mailer (Medium)",  category: "mailers", basePrice: 45,  moq: 200, image: courierMailerImg },
  { id: "mock-mailer-2",  slug: "mock-return-mailer-tear",       name: "Return Mailer with Tear-Strip",  category: "mailers", basePrice: 60,  moq: 200, image: returnMailerImg },
];

export const MOCK_PRODUCTS: Product[] = seeds.map((s) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  category: s.category,
  description: `${s.name} — sample item. Connect the live catalogue to see real specs.`,
  moq: s.moq,
  sizes: [],
  tags: [],
  image: s.image,
  images: [s.image],
  isDiscount: false,
  isNewArrival: false,
  isFastMoving: false,
  industryIds: [],
  totalClicks: 0,
  monthlyClicks: 0,
  totalEnquiries: 0,
  monthlyEnquiries: 0,
  basePrice: s.basePrice,
}));
