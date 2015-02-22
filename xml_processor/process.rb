require 'nokogiri'
require 'active_support/core_ext/hash/conversions'

ds_full   = 'dinesafe.xml'
ds_sample = 'dinesafe_sample.xml'
ds_short  = 'dinesafe_really_short_sample.xml'

# DineSafe has a lot of non-restaurant establishments. We only care about these ones:
ACCEPTABLE_ESTABLISHMENTS = [
  "Food Take Out",                  "Restaurant",                           "Food Court Vendor",
  "Bakery",                         "Refreshment Stand (Stationary)",       "Food Caterer",                   
  "Cafeteria - Public Access",      "Ice Cream / Yogurt Vendors",           "Cocktail Bar / Beverage Room",   
  "Bake Shop",                      "College/University Food services",     "Hot Dog Cart"
]


def get_hash_from_xml(path)
  f = File.open(path)
  xml = Nokogiri::XML(f)
  f.close

  Hash.from_xml(xml.to_s)["ROWDATA"]["ROW"]
end


data = get_hash_from_xml(ds_full)
puts get_list_of_all_establishment_types(data)










###### LESS IMPORTANT STUFF

# One-time method to generate a full list of establishment types
def get_list_of_all_establishment_types(data)
  types = []
  data.each do |r|
    types << r["ESTABLISHMENTTYPE"]
  end

  types.uniq!
end
