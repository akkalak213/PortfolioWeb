// src/lib/iconMap.tsx
import { 
  Mail, Phone, MessageCircle, Facebook, Github, Linkedin, 
  Globe, Twitter, Instagram, Youtube, MapPin, Link 
} from 'lucide-react'

export const IconMap: Record<string, any> = {
  Mail,
  Phone,
  MessageCircle, // ใช้สำหรับ Line
  Facebook,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Link // Icon สำรอง
}

export const getIcon = (iconName: string) => {
  return IconMap[iconName] || Link
}