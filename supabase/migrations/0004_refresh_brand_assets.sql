update public.collections
set image_url = case slug
  when 'joining-gifts' then '/SBanners/SBanners/JOINING.png'
  when 'employee-welcome-kits' then '/SBanners/SBanners/JOINING.png'
  when 'premium-gifts' then '/SBanners/SBanners/PREMIUM.png'
  when 'luxury-gifts' then '/SBanners/SBanners/LUXURY.png'
  when 'eco-gifts' then '/SBanners/SBanners/ECO.png'
  else image_url
end
where slug in ('joining-gifts', 'employee-welcome-kits', 'premium-gifts', 'luxury-gifts', 'eco-gifts');

update public.categories
set image_url = case slug
  when 'office-stationery' then '/SBanners/SBanners/JOINING.png'
  when 'premium-gift-sets' then '/SBanners/SBanners/PREMIUM.png'
  when 'luxury-gift-sets' then '/SBanners/SBanners/LUXURY.png'
  when 'eco-gift-sets' then '/SBanners/SBanners/ECO.png'
  else image_url
end
where slug in ('office-stationery', 'premium-gift-sets', 'luxury-gift-sets', 'eco-gift-sets');
