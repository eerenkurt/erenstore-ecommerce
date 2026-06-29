using Microsoft.EntityFrameworkCore;
using Entities.Models; 

namespace Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // tablolarımızı buraya tanımlıyoruz
    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            // bir ürünün bir tane satıcısı olur
            entity.HasOne(p => p.Seller)
                // bir satıcının birden fazla ürünü olabilir (WithMany boş kalabilir)
                .WithMany() 
                .HasForeignKey(p => p.SellerId)
                // kullanıcı silinirse ürünleri de silinsin (Cascade Delete)
                .OnDelete(DeleteBehavior.Cascade); 
        });
    }
}