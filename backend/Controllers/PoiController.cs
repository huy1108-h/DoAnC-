using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Stall;

[Route("api/[controller]")]
[ApiController]
public class NarrationPointController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SupabaseStorageService _storage;

    public NarrationPointController(AppDbContext context, SupabaseStorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    public class CreatePoiDto
    {
        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int ActivationRadius { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
        public IFormFile? Image { get; set; }
        public int CategoryId { get; set; }
        public string? PriceRange { get; set; }
        public string? OpeningHours { get; set; }
        public string? Description { get; set; }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.NarrationPoints
            .Select(p => new {
                p.Id, p.Name, p.Latitude, p.Longitude,
                p.ActivationRadius, p.Priority, p.ImageWeb, p.IsActive,
                Status = _context.Stalls
                    .Where(s => s.NarrationPointsId == p.Id)
                    .Select(s => s.Status.ToString())
                    .FirstOrDefault(),
                FoodInfo = _context.FoodPlaces
                    .Where(fp => fp.NarrationPointId == p.Id)
                    .Select(fp => new {
                        fp.Id, fp.CategoryId, fp.PriceRange,
                        fp.OpeningHours, fp.Description
                    }).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _context.NarrationPoints.FindAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreatePoiDto dto)
    {
        Console.WriteLine($"[DEBUG] CategoryId = {dto.CategoryId}");

        if (dto.CategoryId == 0)
            return BadRequest("categoryId is required");

        string? localPath = null;
        string? supaUrl = null;

        if (dto.Image != null)
        {
            // Đọc bytes 1 lần dùng cho cả 2 mục đích
            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await dto.Image.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            // ✅ 1. Lưu local cho admin
            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            await System.IO.File.WriteAllBytesAsync(Path.Combine(folder, fileName), fileBytes);
            localPath = "/images/" + fileName;

            // ✅ 2. Upload lên Supabase Storage cho mobile
            using var supaStream = new MemoryStream(fileBytes);
            supaUrl = await _storage.UploadAsync(supaStream, dto.Image.FileName, dto.Image.ContentType);
        }

        var point = new NarrationPoint
        {
            Name = dto.Name,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            ActivationRadius = dto.ActivationRadius,
            Priority = dto.Priority,
            IsActive = dto.IsActive,
            ImageWeb = localPath,
            IsCommercial = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.NarrationPoints.Add(point);
        await _context.SaveChangesAsync();

        // ✅ 3. Lưu Supabase URL vào bảng images cho mobile
        if (!string.IsNullOrEmpty(supaUrl))
        {
            _context.Images.Add(new Image
            {
                NarrationPointId = point.Id,
                ImageUrl = supaUrl
            });
        }

        _context.Stalls.Add(new Stall
        {
            NarrationPointsId = point.Id,
            CategoriesId = dto.CategoryId,
            Status = Stall.StallStatus.Unclaimed,
            OwnerId = null,
            Latitude = (float?)dto.Latitude,
            Longitude = (float?)dto.Longitude,
            ImageUrl = localPath
        });

        _context.FoodPlaces.Add(new FoodPlace
        {
            NarrationPointId = point.Id,
            CategoryId = dto.CategoryId,
            PriceRange = dto.PriceRange,
            OpeningHours = dto.OpeningHours,
            Description = dto.Description
        });

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = point.Id }, point);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] NarrationPoint updated)
    {
        if (id != updated.Id) return BadRequest();

        var item = await _context.NarrationPoints.FindAsync(id);
        if (item == null) return NotFound();

        item.Name = updated.Name;
        item.ActivationRadius = updated.ActivationRadius;
        item.Latitude = updated.Latitude;
        item.Longitude = updated.Longitude;
        item.Priority = updated.Priority;
        item.UpdatedAt = DateTime.UtcNow;

        // ✅ Xử lý ảnh mới nếu admin upload khi cập nhật
        var imageFile = Request.Form.Files["image"];
        if (imageFile != null && imageFile.Length > 0)
        {
            // Đọc bytes 1 lần dùng cho cả 2 mục đích
            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await imageFile.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            // ✅ 1. Lưu local cho admin
            var fileName = Guid.NewGuid() + Path.GetExtension(imageFile.FileName);
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            await System.IO.File.WriteAllBytesAsync(Path.Combine(folder, fileName), fileBytes);
            var localPath = "/images/" + fileName;
            item.ImageWeb = localPath;

            // ✅ 2. Upload lên Supabase Storage cho mobile
            using var supaStream = new MemoryStream(fileBytes);
            var supaUrl = await _storage.UploadAsync(supaStream, imageFile.FileName, imageFile.ContentType);

            // ✅ 3. Xóa ảnh cũ trong bảng images, insert Supabase URL mới
            var oldImages = _context.Images.Where(i => i.NarrationPointId == id);
            _context.Images.RemoveRange(oldImages);
            _context.Images.Add(new Image
            {
                NarrationPointId = id,
                ImageUrl = supaUrl
            });

            // Cập nhật stall luôn
            var stallForImage = await _context.Stalls
                .FirstOrDefaultAsync(s => s.NarrationPointsId == id);
            if (stallForImage != null)
                stallForImage.ImageUrl = localPath;
        }

        var foodPlace = await _context.FoodPlaces
            .FirstOrDefaultAsync(fp => fp.NarrationPointId == id);

        var catId = Request.Form["categoryId"];
        var pRange = Request.Form["priceRange"];
        var oHours = Request.Form["openingHours"];
        var desc = Request.Form["description"];

        if (foodPlace != null)
        {
            if (!string.IsNullOrEmpty(catId)) foodPlace.CategoryId = int.Parse(catId);
            foodPlace.PriceRange = pRange;
            foodPlace.OpeningHours = oHours;
            foodPlace.Description = desc;
        }

        var stall = await _context.Stalls
            .FirstOrDefaultAsync(s => s.NarrationPointsId == id);

        if (stall != null)
        {
            stall.Latitude = (float?)updated.Latitude;
            stall.Longitude = (float?)updated.Longitude;
            if (!string.IsNullOrEmpty(catId))
                stall.CategoriesId = int.Parse(catId);

            var isActiveStr = Request.Form["isActive"];
            bool isActive = isActiveStr == "true";
            stall.Status = isActive ? StallStatus.Active : StallStatus.Closed;
            item.IsActive = isActive;
        }

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.NarrationPoints.FindAsync(id);
        if (item == null) return NotFound();

        var relatedHistories = _context.Histories.Where(h => h.NarrationPointId == id);
        _context.Histories.RemoveRange(relatedHistories);

        var relatedTourPois = _context.TourPois.Where(t => t.poi_id == id);
        _context.TourPois.RemoveRange(relatedTourPois);

        var relatedStalls = _context.Stalls.Where(s => s.NarrationPointsId == id);
        _context.Stalls.RemoveRange(relatedStalls);

        var relatedFoods = _context.FoodPlaces.Where(f => f.NarrationPointId == id);
        _context.FoodPlaces.RemoveRange(relatedFoods);

        var relatedTranslations = _context.NarrationTranslations.Where(t => t.NarrationPointId == id);
        _context.NarrationTranslations.RemoveRange(relatedTranslations);

        var relatedImages = _context.Images.Where(i => i.NarrationPointId == id);
        _context.Images.RemoveRange(relatedImages);

        _context.NarrationPoints.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}