// ================= BACKEND: HistoryController (Improved) =================
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class HistoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var histories = await _context.Histories
            .OrderByDescending(h => h.created_at)
            .Take(100)
            .ToListAsync();

        return Ok(histories);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)
    {
        var histories = await _context.Histories
            .Where(h => h.users_id == userId)
            .OrderByDescending(h => h.created_at)
            .ToListAsync();

        return Ok(histories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] History history)
    {
        if (history == null)
            return BadRequest();

        history.created_at = DateTime.UtcNow;

        await _context.Histories.AddAsync(history);
        await _context.SaveChangesAsync();

        return Ok(history);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow.Date;

        var total = await _context.Histories.CountAsync();
        var todayCount = await _context.Histories
            .Where(h => h.created_at >= today)
            .CountAsync();

        var topPois = await _context.Histories
            .GroupBy(h => h.NarrationPointId)
            .Select(g => new {
                poi = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToListAsync();

        return Ok(new {
            total,
            today = todayCount,
            topPois
        });
    }
}




