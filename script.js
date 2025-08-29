// 🔧 Fungsi bantu untuk ambil ID dari link Google Drive
function extractDriveId(url) {
  const match = url.match(/id=([^&]+)/);
  return match ? match[1] : '';
}

// 🗺️ Inisialisasi peta dengan tampilan satelit Google
const map = L.map('map').setView([-0.3, 109.6], 10);
L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  attribution: '© Google',
  maxZoom: 20
}).addTo(map);

// 🌐 Layer global untuk filter dan pencarian
let geoLayer;
let geoData;

// 📥 Ambil data GeoJSON dari Apps Script
fetch('https://script.google.com/macros/s/AKfycbx87T8HLRIf6mhHouu6pH8ise9ZZkZ8WVX4XkC-5aJR5UdLCQ0lH5fo1dOUMvQbh6GLpw/exec')
  .then(res => res.json())
  .then(data => {
    geoData = data;

    geoLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        layer.on('click', () => showSidebar(feature.properties));
      }
    }).addTo(map);

    // 🎛️ Filter Tahun Program
    document.getElementById('yearFilter').addEventListener('change', function () {
      const selectedYear = this.value;
      geoLayer.clearLayers();

      const filtered = selectedYear === 'all'
        ? geoData.features
        : geoData.features.filter(f => f.properties.tahun_program == selectedYear);

      geoLayer.addData(filtered);
    });

    // 🔍 Pencarian Poktan/Ketua/Desa
    document.getElementById('searchBtn').addEventListener('click', function () {
      const keyword = document.getElementById('searchInput').value.toLowerCase();

      geoLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const match = (
          (props.nama_poktan || '').toLowerCase().includes(keyword) ||
          (props.nama_ketua || '').toLowerCase().includes(keyword) ||
          (props.desa || '').toLowerCase().includes(keyword)
        );

        if (match) {
          map.setView(layer.getLatLng(), 14);
          showSidebar(props);
        }
      });
    });
  });

// 📋 Tampilkan info di sidebar
function showSidebar(props) {
  const sidebar = document.getElementById('sidebar');
  const sidebarContent = document.querySelector('.sidebar-content');
  const fotoId = extractDriveId(props.foto_kegiatan || '');
  const fotoUrl = fotoId ? `https://drive.google.com/uc?export=view&id=${fotoId}` : '';

  sidebarContent.innerHTML = `
    <div class="sidebar-header">
      ${fotoUrl ? `<img src="${fotoUrl}" class="header-img" />` : ''}
    </div>
    <h2>${props.nama_poktan || 'Tanpa Nama'}</h2>
    <p><strong>Ketua:</strong> ${props.nama_ketua || '-'}</p>
    <p><strong>Kecamatan:</strong> ${props.kecamatan || '-'}</p>
    <p><strong>Desa:</strong> ${props.desa || '-'}</p>
    <p><strong>Dusun:</strong> ${props.dusun || '-'}</p>
    <p><strong>Luas Lahan:</strong> ${props.luas_lahan || '-'} Ha</p>
    <p><strong>Tahun Program:</strong> ${props.tahun_program || '-'}</p>
    <p><strong>Kegiatan:</strong> ${props.kegiatan || '-'}</p>
    <p><strong>Tanggal:</strong> ${props.tanggal_kegiatan || '-'}</p>
    <p><strong>Kebutuhan:</strong> ${props.kebutuhan || '-'}</p>
    <p><strong>Deskripsi:</strong> ${props.deskripsi_kebutuhan || '-'}</p>
  `;

  sidebar.style.display = 'block';

  // ❌ Tombol tutup sidebar
  const closeBtn = document.getElementById('closeSidebar');
  if (closeBtn) {
    closeBtn.onclick = () => {
      sidebar.style.display = 'none';
    };
  }
}
