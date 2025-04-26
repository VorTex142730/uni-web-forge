import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import MidnightMasqueradeImage from '@/assets/midnight-masquerade.jpg';

const ProductDetailsPage = () => {
  const [entry, setEntry] = useState('');
  const [dinner, setDinner] = useState('');
  const [tab, setTab] = useState<'description' | 'additional'>('description');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
        <span className="text-gray-500">/</span>
        <Link to="/booking" className="text-gray-500 hover:text-blue-600">booking</Link>
        <span className="text-gray-500">/</span>
        <span>MIDNIGHT MASQUERADE</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative">
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 z-10">
            SALE!
          </div>
          <div className="relative group">
            <img 
              src={MidnightMasqueradeImage} 
              alt="MIDNIGHT MASQUERADE" 
              className="w-full rounded-lg"
            />
            <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">MIDNIGHT MASQUERADE</h1>
          <div className="text-xl mb-6">
            <span className="text-gray-900">₹700.00</span>
            <span className="mx-2">–</span>
            <span className="text-gray-900">₹1,649.00</span>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="mb-4">
              Step into a world of <strong>glamour, music, and unforgettable moments</strong> at <strong>Prom Night 2025</strong>! Whether you're coming with a date or rolling in with your squad, this is the <strong>ultimate</strong> night to dress up, dance, and celebrate like never before!
            </p>

            <div className="mb-4">
              <strong>Location :</strong> Tom Tom Skybar. The town's biggest rooftop oasis at our classy rooftop sky bar. Where the stars meet the spirits, and the city unfolds beneath you.
            </div>

            <div className="mb-4">
              <strong>Date :</strong> 18 april 2025<br />
              <strong>Time :</strong> 6pm onwards.
            </div>

            <p className="text-red-500 font-medium">
              No more time to waste, The booking has been started. Grab your early bird offer before its too late !!
            </p>
            <p className="text-red-500 font-medium">Early bird offer applied</p>
          </div>

          {/* Product Options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">ENTRY</label>
              <Select value={entry} onValueChange={setEntry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="couple">Couple entry</SelectItem>
                  <SelectItem value="single">Single entry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">DINNER</label>
              <div className="flex items-center gap-2">
                <Select value={dinner} onValueChange={setDinner}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unlimited Food" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited Food</SelectItem>
                    <SelectItem value="no-food">No food</SelectItem>
                  </SelectContent>
                </Select>
                <button className="text-red-500 text-sm">Clear</button>
              </div>
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3">
            Add to cart
          </Button>

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">SPECS</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-600">SKU:</div>
              <div>200</div>
              <div className="text-gray-600">Category:</div>
              <div className="text-red-500">booking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 text-sm font-medium focus:outline-none border-b-2 transition-colors ${tab === 'description' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTab('description')}
            >
              Description
            </button>
            <button
              className={`py-4 px-1 text-sm font-medium focus:outline-none border-b-2 transition-colors ${tab === 'additional' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTab('additional')}
            >
              Additional information
            </button>
          </nav>
        </div>

        {tab === 'description' && (
          <div className="py-8 prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <h3 className="text-xl font-bold mb-4">MIDNIGHT MASQUERADE</h3>
            <p className="mb-4">
              Dreamwedz & Hotspot is coming up with their first major event, one that would set a benchmark on how an unforgettable night should be like. Our first event "Midnight Masquerade" is a moment where you join hands with your loved ones and make it the best time that you would cherish and smile when you look back.
            </p>
            <p className="mb-4">
              This night is filled with moments that would make you laugh and admire with your partner while you sway through the dance floor by listening to your favourite music, playing games, listening to people share their love stories, and sharing your own journey with others. An overall package of perfection at its finest. Join us at the Midnight Masquerade.
            </p>
            <div className="mb-4">
              <strong>Event details :</strong>
              <ul className="list-none pl-0">
                <li>– Date : 18 April 2025</li>
                <li>– Event location : Tom Tom SkyBar and Club,Navi Mumbai " The town's biggest rooftop oasis in Navi Mumbai "</li>
                <li>– Dinner : Veg/Non-veg</li>
              </ul>
            </div>
            <div className="mb-4">
              <strong>Included activities :</strong>
              <ul className="list-none pl-0">
                <li>– Prom dance 💃 🕺</li>
                <li>– Fun Games And Activities</li>
                <li>– Live DJ & Dance Floor 🎶 🪩</li>
                <li>– Dinner date 🍽️ 🥂</li>
                <li>– Cool sponsors</li>
              </ul>
            </div>
            <p className="mb-4">
              Dinner – 2 drinks, 4 types of starters, Noodles with veg and non veg gravy. ( Unlimited )
            </p>
            <p className="font-bold">
              LIMITED TICKETS – BOOK NOW BEFORE IT GETS SOLD OUT! 🏆
            </p>
          </div>
        )}
        {tab === 'additional' && (
          <div className="py-8">
            <div className="bg-white border rounded-lg p-8">
              <h2 className="text-xl font-semibold mb-6">Additional information</h2>
              <div className="divide-y divide-gray-200">
                <div className="flex justify-between py-4">
                  <span className="font-medium text-gray-700">ENTRY</span>
                  <span className="italic text-gray-500">Couple entry, Single entry</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="font-medium text-gray-700">DINNER</span>
                  <span className="italic text-gray-500">No food, Unlimited Food</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage; 