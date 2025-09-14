const Listing = require("../models/listing");
const axios = require('axios');

module.exports.index = async (req,res) =>{
    const allListings = await Listing.find({});
        res.render("listings/index",{allListings});
};

module.exports.renderNewForm =  (req,res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).
    populate({path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
         req.flash("error" , "Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
    res.render("listings/show", {listing});
};

module.exports.createListing = async (req, res, next) => {
  const { location } = req.body.listing;
  const apiKey = process.env.MAP_TOKEN;

  let latitude = null;
  let longitude = null;

  try {
    const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: {
        text: location,
        apiKey: apiKey,
        limit: 1
      }
    });

    if (response.data.features.length) {
      latitude = response.data.features[0].geometry.coordinates[1];
      longitude = response.data.features[0].geometry.coordinates[0];
    }
  } catch (e) {
    console.error('Error geocoding location:', e);
  }

  const Data = req.body.listing;
  const newListing = new Listing(Data);
  newListing.owner = req.user._id;

  newListing.latitude = latitude;
  newListing.longitude = longitude;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};


module.exports.renderEditForm = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
         req.flash("error" , "Listing you requested for does not exist!");
         return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250")
    res.render("listings/edit",{ listing , originalImageUrl});
};

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
    const { latitude, longitude, location } = req.body.listing;

    const updateData = {
        ...req.body.listing,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location: location,
    };
    let listing = await Listing.findByIdAndUpdate(id, updateData, {...req.body.listing});

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
     req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
};

// Search Listings
module.exports.searchListing =  async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');

  const listings = await Listing.find({
    $or: [
      { title: regex },
      { location: regex },
      {country: regex},
      { description: regex },
    ]
  });

  res.render('listings/index', { allListings: listings, q });
};
