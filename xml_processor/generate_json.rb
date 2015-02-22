require 'nokogiri'
require 'active_support/core_ext/hash/conversions'

require_relative 'processor'

ds_full   = 'dinesafe.xml'
ds_sample = 'dinesafe_sample.xml'
ds_short  = 'dinesafe_really_short_sample.xml'

# Write JSON to our extension folder
Processor::process(ds_full,   '../extension/data.json')
Processor::process(ds_sample, '../extension/data_sample.json')







