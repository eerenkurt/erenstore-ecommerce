using Microsoft.EntityFrameworkCore;
using Entities.Models; 

namespace Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // tablolarımızı buraya tanımlıyoruz
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
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
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // müşteri silinirse siparişleri patlamasın diye Restrict yapıyoruz
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            // bir sipariş kaleminin bir ana siparişi olur, ana sipariş silinirse kalemi de silinir (Cascade)
            entity.HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // bir sipariş kaleminin bir ürünü olur
            entity.HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}