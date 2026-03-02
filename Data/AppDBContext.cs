using Microsoft.EntityFrameworkCore;
using FoodMapAPI.Models;

namespace FoodMapAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<NarrationPoint> narration_points { get; set; }
        public DbSet<FoodPlaces> food_places { get; set; }
        public DbSet<Category> categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table mappings
            modelBuilder.Entity<NarrationPoint>().ToTable("narration_points");
            modelBuilder.Entity<FoodPlaces>().ToTable("food_places");
            modelBuilder.Entity<Category>().ToTable("categories");
        }
    }
}
