using Microsoft.AspNetCore.Mvc;
using FoodMapAPI.Data;
using System.Linq;

namespace FoodMapAPI.Controllers
{
    [ApiController]
    [Route("api/places")]
    public class PlacesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlacesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var data = (
                from np in _context.narration_points
                join fp in _context.food_places on np.id equals fp.narration_point_id
                join c in _context.categories on fp.category_id equals c.id
                select new
                {
                    np.id,
                    np.name,
                    np.latitude,
                    np.longitude,
                    fp.description,
                    fp.price_range,
                    fp.opening_hours,
                    category = c.name
                }
            ).ToList();

           return Ok(data);
        }
    }
}