require 'nokogiri'
require 'active_support/core_ext/hash/conversions'

require_relative 'processor'

ds_full   = 'dinesafe.xml'
ds_sample = 'dinesafe_sample.xml'
ds_short  = 'dinesafe_really_short_sample.xml'

# DineSafe has a lot of non-restaurant establishments. We only care about these ones:


data = Processor::get_hash_from_xml(ds_sample)

data = Processor::filter_by_establishment(data)

data = Processor::format_data(data)

puts data





