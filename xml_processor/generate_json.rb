require 'nokogiri'
require 'active_support/core_ext/hash/conversions'

require_relative 'processor'

ds_full   = 'dinesafe.xml'
ds_sample = 'dinesafe_sample.xml'
ds_short  = 'dinesafe_really_short_sample.xml'

# DineSafe has a lot of non-restaurant establishments. We only care about these ones:


data = Processor::get_hash_from_xml(ds_short)

puts data







###### LESS IMPORTANT STUFF

# One-time method to generate a full list of establishment types
def get_list_of_all_establishment_types(data)
  types = []
  data.each do |r|
    types << r["ESTABLISHMENTTYPE"]
  end

  types.uniq!
end
