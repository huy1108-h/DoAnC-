using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public StoresController(AppDbContext context)
    {
        _context = context;
    }

[HttpGet]
public async Task<IActionResult> Get(string? lang)
{
    var query = _context.Translations.AsQueryable();

    if (!string.IsNullOrEmpty(lang))
    {
        query = query.Where(t => t.language_id == lang);
    }

    var data = await query
        .Select(t => new
        {
            t.store_id,
            name = t.food_name,   // map lại đây
            t.description,
            t.audio_url
        })
        .ToListAsync();

    return Ok(data);
}
}