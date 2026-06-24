"use client";
import dynamic from "next/dynamic";

export type { Location } from "./LocationMap";

const LocationMap = dynamic(() => import("./LocationMap"), { ssr: false });

export default LocationMap;
