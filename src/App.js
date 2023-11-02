// React.js ile araba kiralama web sayfası

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Araç bilgilerini json serverdan almak için bir fonksiyon
const getCarData = async () => {
  try {
    const response = await axios.get("http://localhost:3000/cars");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// Araba kiralama ana bileşeni
const CarRental = () => {

  // Sayfa yüklendiğinde verileri localStorage'dan al
  const savedData = localStorage.getItem("carRentalData");
  const initialData = savedData ? JSON.parse(savedData) : { rentals: [] };

  // Durum değişkenleri
  const [name, setName] = useState(""); // İsim soyisim
  const [license, setLicense] = useState(""); // Ehliyet numarası
  const [licenseLength, setLicenseLength] = useState(0); // Ehliyet numarası uzunluğu
  const [car, setCar] = useState(null); // Seçilen araç
  const [startDate, setStartDate] = useState(""); // Kiralama başlangıç tarihi
  const [endDate, setEndDate] = useState(""); // Kiralama bitiş tarihi
  const [carData, setCarData] = useState([]); // Araç bilgileri
  const [rentals, setRentals] = useState(initialData.rentals); // Kiralanan araçların listesi
  const [selectedRental, setSelectedRental] = useState(null); // Detayları popup'da göstermek için alınacak kiralama bilgisi


  // Araç bilgilerini json serverdan almak için useEffect kullanımı
  useEffect(() => {
    getCarData().then((data) => {
      setCarData(data);
    });
  }, []);

  //Popup Detay sayfası
  const CarDetailsPopup = ({ rental, onClose }) => {

    //Gün sayısı ve toplam ücret değişken ataması
    const { days, totalCost } = calculateRentalCost(rental.startDate, rental.endDate);

    return (
      <div className="popup">
        <div className="popup-content">
          <h2>Detaylar</h2>
          <p><strong>İsim Soyisim:</strong> {rental.name}</p>
          <p><strong>Ehliyet Numarası:</strong> {rental.license}</p>
          {/* <p><strong>Araç Markası:</strong> {rental.car.brand}</p> */}
          <p><strong>Araç Markası:</strong> {rental.car.model}</p>
          <p><strong>Plaka:</strong> {rental.car.plate}</p>
          <p><strong>Renk:</strong> {rental.car.color}</p>
          <p><strong>Kiralanan Gün Sayısı:</strong> {days} gün</p>
          <p><strong>Toplam Ücret:</strong> {totalCost} ₺</p>
          <p><strong>Kiralama Başlangıç Tarihi:</strong> {rental.startDate}</p>
          <p><strong>Kiralama Bitiş Tarihi:</strong> {rental.endDate}</p>
          <button onClick={onClose}>Kapat</button>
        </div>
      </div>
    );
  };

  // Detayları popup ile göster
  const showDetailsPopup = (rental) => {
    setSelectedRental(rental);
  };

  // Popup'ı kapat
  const closeDetailsPopup = () => {
    setSelectedRental(null);
  };

  //Ehliyet numarası uzunluğunu takip eden fonksiyon
  const handleLicenseChange = (e) => {
    const newLicense = e.target.value;

    // Ehliyet numarasının uzunluğu 10 ise daha fazla karakter girişini engelle
    if (newLicense.length <= 10) {
      setLicenseLength(newLicense.length); // Ehliyet numarasının uzunluğunu güncelle
      setLicense(newLicense); // Ehliyet numarasını güncelle
    }
  };

  // Kirala butonuna basıldığında çalışacak fonksiyon
  const handleRent = () => {
    // Gerekli bilgilerin girilip girilmediğini kontrol etmek için bir değişken
    let valid = true;

    // Gerekli bilgilerin girilmediği durumlarda uyarı mesajı göstermek için bir değişken
    let message = "";

    // İsim soyisim girilmediyse valid değişkenini false yap ve mesaja ekle
    if (!name) {
      valid = false;
      message += "Lütfen isim soyisim giriniz.\n";
    }

    // Ehliyet numarası girilmediyse valid değişkenini false yap ve mesaja ekle
    if (!license) {
      valid = false;
      message += "Lütfen ehliyet numarası giriniz.\n";
    } else if (!/^\d{10}$/.test(license)) {
      // Ehliyet numarasının 10 haneli ve sadece sayılardan oluştuğunu kontrol et
      valid = false;
      message += "Ehliyet numarası 10 haneli ve sadece sayılardan oluşmalıdır.\n";
    }

    // Araç seçilmediyse valid değişkenini false yap ve mesaja ekle
    if (!car) {
      valid = false;
      message += "Lütfen bir araç seçiniz.\n";
    }

    // Kiralama başlangıç tarihi girilmediyse valid değişkenini false yap ve mesaja ekle
    if (!startDate) {
      valid = false;
      message += "Lütfen kiralama başlangıç tarihini giriniz.\n";
    }

    // Kiralama bitiş tarihi girilmediyse valid değişkenini false yap ve mesaja ekle
    if (!endDate) {
      valid = false;
      message += "Lütfen kiralama bitiş tarihini giriniz.\n";
    }

    // Kiralama başlangıç ve bitiş tarihleri arasındaki geçerliliği kontrol et
    if (startDate > endDate) {
      alert("Kiralama başlangıç tarihi, bitiş tarihinden önce olmalıdır.");
      return; // Kiralamayı devam ettirme
    }

    // Tüm gerekli bilgiler girildiyse
    if (valid) {
      // Kiralanan araçların listesine yeni bir kiralama bilgisi ekle
      setRentals([
        ...rentals,
        {
          name,
          license,
          car,
          startDate,
          endDate,
          delivered: false, // Teslim edildi durumunu false olarak belirle
        },
      ]);

      // Ehliyet numarası sayacını sıfırla
      setLicenseLength(0);

      // Durum değişkenlerini sıfırla
      setName("");
      setLicense("");
      setCar(null);
      setStartDate("");
      setEndDate("");

      // Araç seçim bileşenindeki aracı kaldır
      const updatedCarData = carData.filter((c) => c.id !== car.id);
      setCarData(updatedCarData);

      // Başarılı mesajı göster
      alert("Araç başarıyla kiralandı.");
    } else {
      // Gerekli bilgiler girilmediyse uyarı mesajını göster
      alert(message);
    }

    // Verileri localStorage'a kaydet
    localStorage.setItem("carRentalData", JSON.stringify({ rentals: rentals }));
  };

  // Sayfa yenilendiğinde verileri güncelle
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("carRentalData", JSON.stringify({ rentals: rentals }));
  });

  // Teslim alındı butonuna basıldığında çalışacak fonksiyon
  const handleDeliver = (index) => {
    // Kiralanan araçların listesini kopyala
    const newRentals = [...rentals];

    // Seçilen kiralama bilgisinin teslim edildi durumunu true yap
    newRentals[index].delivered = true;

    // Kiralanan araçların listesini güncelle
    setRentals(newRentals);

    // Teslim edilen aracı tekrar seçim bileşenine ekle
    setCarData([...carData, newRentals[index].car]);

    // Başarılı mesajı göster
    alert("Araç teslim alındı.");
  };

  //Sayfayı resetleme butonu için mevcut değerleri silen fonksiyon
  const resetState = () => {
    setName("");
    setLicense("");
    setLicenseLength(0);
    setCar(null);
    setStartDate("");
    setEndDate("");
    setSelectedRental(null);
    setRentals([]);
    setCarData([]);
  };

  //Silinmiş araba seçim listesini geri yüklemek için fonksiyon
  const resetAndReload = () => {
    resetState();

    // localStorage'daki kiralama verilerini temizle
    localStorage.removeItem("carRentalData");

    // Verileri boş bir dizi olarak ayarla
    setRentals([]);
    setCarData([]);

    // Araç verilerini yeniden çek
    getCarData().then((data) => {
      setCarData(data);
    });
  };
  //Aracın kaç gün kiralandığını ve ücretini hesaplamak için fonksiyon
  const calculateRentalCost = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end - start);
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Gün cinsinden farkı hesapla
    const dailyRate = 850; // Günlük araç kiralık ücreti (TL)
    const totalCost = days * dailyRate; // Toplam kiralama ücretini hesapla
    return { days, totalCost };
  };

  // Detaylar linkine tıklandığında çalışacak fonksiyon
  const handleDetails = (index) => {
    // Seçilen kiralama bilgisini al
    const rental = rentals[index];
    showDetailsPopup(rental);
    //   Popup detay sayfası sonrası iptal edilen alert yapısı
    //   // Detayları göstermek için bir mesaj oluştur
    //   let message = "";
    //   message += `İsim soyisim: ${rental.name}\n`;
    //   message += `Ehliyet numarası: ${rental.license}\n`;
    //   // message += `Araç markası: ${rental.car.brand}\n`;
    //   message += `Araç markası: ${rental.car.model}\n`;
    //   message += `Araç plakası: ${rental.car.plate}\n`;
    //   message += `Araç rengi: ${rental.car.color}\n`;
    //   message += `Kiralama başlangıç tarihi: ${rental.startDate}\n`;
    //   message += `Kiralama bitiş tarihi: ${rental.endDate}\n`;

    //   // Mesajı göster
    //   alert(message);
  };


  //Form bileşenleri
  return (
    <div className="car-rental">
      <h1>Car Rental</h1>
      <div className="car-rental-form">
        <h2>Kiralama Bilgileri</h2>
        <div className="form-group">
          <label htmlFor="name">İsim Soyisim</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="license">Ehliyet Numarası</label>
          <div className="license-input">
            <input
              type="text"
              id="license"
              value={license}
              onChange={handleLicenseChange}
            />
            <div className="license-counter">{licenseLength}/10</div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="car">Araç Bilgisi</label>
          <select
            id="car"
            value={car ? car.id : ""}
            onChange={(e) =>
              setCar(carData.find((c) => c.id === parseInt(e.target.value)))
            }
          >
            <option value="">Lütfen bir araç seçiniz</option>
            {carData?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} {c.color} ({c.plate})
              </option>
            ))}
          </select>

        </div>
        <div className="form-group">
          <label htmlFor="startDate">Kiralama Başlangıç Tarihi</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Kiralama Bitiş Tarihi</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="rent-button" onClick={handleRent}>Kirala</button>
        <button className="reset-page-button" onClick={resetAndReload}>Sayfayı Sıfırla</button>
      </div>
      <div className="car-rental-list">
        <h2>Kiralanan Araçlar</h2>
        {rentals.length > 0 ? (
          <ul>
            {rentals.map((r, i) => (
              <li key={i}>
                {r.car.brand}{"        "}
                <b>Araç: </b>{r.car.model}{" "}
                <b>Renk: </b>{r.car.color}{" "}
                <b>Plaka: </b>({r.car.plate}){" "}
                {r.delivered ? (
                  <span>Teslim edildi</span>
                ) : (
                  <>
                    <button onClick={(e) => {
                      e.preventDefault();
                      handleDetails(i)
                    }}>
                      Detaylar
                    </button>{" "}
                    |{" "}
                    <button onClick={() => handleDeliver(i)}>
                      Teslim alındı
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Henüz kiralanan araç yok.</p>
        )}
      </div>

      {/* Detayları göstermek için popup bileşeni */}
      {selectedRental && (
        <CarDetailsPopup rental={selectedRental} onClose={closeDetailsPopup} />
      )}

    </div>
  );
};

export default CarRental;
