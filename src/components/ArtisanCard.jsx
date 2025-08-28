import React from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "./ResponsiveImage";
import { MapPinIcon, StarIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function ArtisanCard({ artisan, size = "medium" }) {
  const sizeClasses = {
    small: "w-full h-32",
    medium: "w-full h-48",
    large: "w-full h-64"
  };

  const cardClasses = {
    small: "p-3",
    medium: "p-4",
    large: "p-6"
  };

  return (
    <Link 
      to={`/artisans/${artisan.id}`}
      className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative">
        <ResponsiveImage
          src={artisan.profileImage}
          alt={`${artisan.name} - Himalayan Artisan`}
          className={`${sizeClasses[size]} group-hover:scale-105 transition-transform duration-300`}
          sizes={size === "large" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
        />
        {artisan.featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-organic-primary text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>
      
      <div className={cardClasses[size]}>
        <h3 className={`font-semibold text-organic-text mb-1 group-hover:text-organic-primary transition-colors ${
          size === "large" ? "text-xl" : "text-base"
        }`}>
          {artisan.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <MapPinIcon className="w-3 h-3 text-organic-primary" />
          <span className="text-organic-text opacity-75 text-xs">{artisan.location}</span>
        </div>
        
        {size !== "small" && (
          <p className="text-organic-text opacity-75 text-sm line-clamp-2 mb-3">
            {artisan.shortBio}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-organic-highlight" />
            <span className="text-organic-highlight font-medium">
              {artisan.experience} years
            </span>
          </div>
          
          {artisan.rating && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-organic-text">{artisan.rating}</span>
            </div>
          )}
        </div>
        
        {artisan.specialties && size === "large" && (
          <div className="mt-3 flex flex-wrap gap-1">
            {artisan.specialties.slice(0, 2).map((specialty, index) => (
              <span 
                key={index}
                className="bg-organic-background text-organic-text px-2 py-1 rounded-full text-xs"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}