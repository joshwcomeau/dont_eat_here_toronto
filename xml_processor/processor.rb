require 'active_support/core_ext/string'

module Processor
  ACCEPTABLE_ESTABLISHMENTS = [
    "Food Take Out",                  "Restaurant",                           "Food Court Vendor",
    "Bakery",                         "Refreshment Stand (Stationary)",       "Food Caterer",                   
    "Cafeteria - Public Access",      "Ice Cream / Yogurt Vendors",           "Cocktail Bar / Beverage Room",   
    "Bake Shop",                      "College/University Food services",     "Hot Dog Cart"
  ]
  NUM_OF_INSPECTIONS = 6

  # Turns an XML file into a ruby array of hashes.
  def self.get_hash_from_xml(path)
    f = File.open(path)
    xml = Nokogiri::XML(f)
    f.close

    Hash.from_xml(xml.to_s)["ROWDATA"]["ROW"]
  end

  # Removes non-restaurant establishments like grocery stores.
  def self.filter_by_establishment(data)
    data.select do |inspection|
      ACCEPTABLE_ESTABLISHMENTS.include? inspection["ESTABLISHMENTTYPE"]
    end
  end


  # Turns the original format into something more usable. limits it to the N most recent inspections, grouped by restaurant, with
  # only the relevant fields kept, and standardized.
  def self.format_data(data)
    formatted_data = []

    # By default, DineSafe inspections are stored in chronological order. We want to reverse this, to only keep the 4 most recent.
    data.reverse!

    data.each do |inspection|
      restaurant_name = inspection["ESTABLISHMENT_NAME"]

      # Let's see if this restaurant has been formatted already
      restaurant = formatted_data.find { |i| i[:name] == restaurant_name }

      if !restaurant
        # Create the new restaurant
        formatted_data << create_restaurant(inspection)

      elsif restaurant[:inspections].count < NUM_OF_INSPECTIONS
        # Add the inspection to the found restaurant
        restaurant[:inspections] << create_inspection(inspection)
      end
    end

    formatted_data
  end

  def self.create_restaurant(inspection)
    {
      name:         inspection["ESTABLISHMENT_NAME"],
      address:      inspection["ESTABLISHMENT_ADDRESS"],
      inspections:  [ create_inspection(inspection) ]
    }    
  end

  def self.create_inspection(inspection)
    {
      date:           inspection["INSPECTION_DATE"],
      status:         format_status(inspection["ESTABLISHMENT_STATUS"]),
      details:        inspection["INFRACTION_DETAILS"],
      severity:       inspection["SEVERITY"].try(:first),
      action:         (inspection["ACTION"]        unless inspection["ACTION"].blank?),
      court_outcome:  (inspection["COURT_OUTCOME"] unless inspection["COURT_OUTCOME"].blank?),
      fine_amount:    (inspection["AMOUNT_FINED"]  unless inspection["AMOUNT_FINED"].blank?)
    }
  end

  # returns 'pass', 'conditional', or 'closed'
  def self.format_status(str)
    str.split(" ").first.downcase
  end

  # Find all the different possible values for a given field
  def self.get_unique_list_of_values(data, field)
    values = []
    data.each do |r|
      values << r[field]
    end

    values.uniq!
  end



end