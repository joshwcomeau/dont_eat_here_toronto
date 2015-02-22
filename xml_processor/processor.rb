module Processor
  ACCEPTABLE_ESTABLISHMENTS = [
    "Food Take Out",                  "Restaurant",                           "Food Court Vendor",
    "Bakery",                         "Refreshment Stand (Stationary)",       "Food Caterer",                   
    "Cafeteria - Public Access",      "Ice Cream / Yogurt Vendors",           "Cocktail Bar / Beverage Room",   
    "Bake Shop",                      "College/University Food services",     "Hot Dog Cart"
  ]

  # Turns an XML file into a ruby array of hashes.
  def self.get_hash_from_xml(path)
    f = File.open(path)
    xml = Nokogiri::XML(f)
    f.close

    Hash.from_xml(xml.to_s)["ROWDATA"]["ROW"]
  end

  # Removes non-restaurant establishments like grocery stores.
  def self.filter_by_establishment(data)

  end


end