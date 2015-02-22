Don't Eat Here
==============

A simple Chrome extension that will add restaurant inspection scores to yelp pages for Toronto restaurants.

When browsing Yelp, an icon will be added to the restaurant page that features the most recent Toronto City Food Inspection result and score. Find out whether that highly-reviewed pita place has rats in the kitchen.

To generate the data, there's a ruby script in xml_processor that will process the official DineSafe data and generate a JSON file in the extension subdirectory.
TODO: Make it pull from the Toronto DineSafe server automatically, set up a rake task to do it weekly and figure out how to auto-publish to Chrome store?