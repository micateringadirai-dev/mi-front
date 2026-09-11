import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import CateringHero from '../components/catering/CateringHero.jsx';
import CookingTicker from '../components/catering/CookingTicker.jsx';
import CookingAnnouncements from '../components/catering/CookingAnnouncements.jsx';
import CateringGallery from '../components/catering/CateringGallery.jsx';
import CateringAbout from '../components/catering/CateringAbout.jsx';
import CateringQuotationForm from '../components/catering/CateringQuotationForm.jsx';
import PreOrderModal from '../components/catering/PreOrderModal.jsx';
import './BusinessPage.scss';

const defaultPackages = [
  { _id: 'wedding-pkg', title: 'Grand Wedding Feast (Biryani / Traditional Meals)' },
  { _id: 'valima-pkg', title: 'Valima & Reception Buffet' },
  { _id: 'housewarming', title: 'Housewarming / Kudikoodal Catering' },
  { _id: 'corporate-pkg', title: 'Corporate Event / Conference Lunch' },
  { _id: 'family-pkg', title: 'Family Gathering & Special Functions' },
  { _id: 'custom-feast', title: 'Custom Feast (Specify requirements below)' },
];

export default function Catering() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Active cooking announcements that have a scheduled date and are pre-order enabled
  const cookingAnnouncements = Array.isArray(events)
    ? events.filter((e) => e.eventDate && e.isActive !== false && e.isPreOrderActive !== false)
    : [];

  // Currently selected announcement for the Dynamic Pre-Order section / popup modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);

  // Pre-Order interactive state
  const [preOrderQty, setPreOrderQty] = useState(1);
  const [preOrderExtras, setPreOrderExtras] = useState({}); // { [extraName]: qty }
  const [submittingPreOrder, setSubmittingPreOrder] = useState(false);
  const [preOrderForm, setPreOrderForm] = useState({
    customerName: '',
    mobileNumber: '',
    deliveryType: 'Delivery',
    address: '',
    additionalNotes: '',
  });

  // General Quotation state
  const [submittingQuotation, setSubmittingQuotation] = useState(false);
  const [quotationForm, setQuotationForm] = useState({
    itemName: 'Grand Wedding Feast (Biryani / Traditional Meals)',
    customerName: '',
    mobileNumber: '',
    numberOfPackets: '',
    orderDate: '',
    deliveryType: 'Delivery',
    address: '',
    foodRequirements: '',
    customExtras: '',
    additionalNotes: '',
  });

  useEffect(() => {
    api
      .get('/catering/events')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setEvents(res.data.data);
        } else {
          setEvents(defaultPackages);
        }
      })
      .catch((err) => {
        console.warn('Could not load live catering events, using default packages:', err.message);
        setEvents(defaultPackages);
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleSelectAnnouncement = (ann, openModal = true) => {
    setSelectedAnnouncement(ann);
    setPreOrderExtras({});
    setPreOrderQty(ann.minPackets || 1);
    let targetDelivery = 'Delivery';
    if (ann.deliveryOption === 'Self Service') {
      targetDelivery = 'Self Service';
    } else if (ann.deliveryOption === 'Delivery') {
      targetDelivery = 'Delivery';
    } else if (preOrderForm.deliveryType) {
      targetDelivery = preOrderForm.deliveryType;
    }
    setPreOrderForm((prev) => ({
      ...prev,
      deliveryType: targetDelivery,
    }));
    toast.success(
      `Selected "${ann.title}" for ${
        ann.eventDate
          ? new Date(ann.eventDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
          : 'cooking day'
      }!`
    );
    if (openModal) {
      setIsPreOrderModalOpen(true);
    }
  };

  const handleToggleSelectAnnouncement = (ann) => {
    if (selectedAnnouncement?._id === ann._id) {
      setIsPreOrderModalOpen(true);
    } else {
      handleSelectAnnouncement(ann, true);
    }
  };

  const handleRemovePreOrderExtra = (extraName) => {
    setPreOrderExtras((prev) => {
      const copy = { ...prev };
      delete copy[extraName];
      return copy;
    });
    toast(`Removed ${extraName}`, { icon: '🗑️' });
  };

  // Pre-Order live pricing & discount calculations
  const unitPrice = selectedAnnouncement?.pricePerPacket || 0;
  const portionUnit = selectedAnnouncement?.portionUnit || 'Packet';
  const mainDishSubtotal = unitPrice * preOrderQty;

  const updatePreOrderExtraQty = (extraName, delta) => {
    setPreOrderExtras((prev) => {
      const current = prev[extraName] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[extraName];
        return copy;
      }
      return { ...prev, [extraName]: updated };
    });
  };

  const getSelectedExtrasList = () => {
    return Object.entries(preOrderExtras)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => {
        const found = selectedAnnouncement?.extraSideDishes?.find((d) => d.name === name);
        return {
          name,
          portion: found?.portion || '',
          price: found?.price || 0,
          quantity: qty,
        };
      });
  };

  const selectedExtrasList = getSelectedExtrasList();
  const extrasSubtotal = selectedExtrasList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const originalSubtotal = mainDishSubtotal + extrasSubtotal;

  const discountType = selectedAnnouncement?.discountType || 'none';
  const discountValue = Number(selectedAnnouncement?.discountValue) || 0;
  let discountAmount = 0;
  if (discountType === 'percentage' && discountValue > 0) {
    discountAmount = Math.round((originalSubtotal * discountValue) / 100);
  } else if (discountType === 'flat' && discountValue > 0) {
    discountAmount = Math.min(originalSubtotal, discountValue);
  }
  const finalPayableTotal = Math.max(0, originalSubtotal - discountAmount);

  const allowedPreOrderDelivery = selectedAnnouncement?.deliveryOption || 'Both';

  useEffect(() => {
    if (
      selectedAnnouncement?.deliveryOption === 'Self Service' &&
      preOrderForm.deliveryType !== 'Self Service'
    ) {
      setPreOrderForm((prev) => ({ ...prev, deliveryType: 'Self Service' }));
    } else if (
      selectedAnnouncement?.deliveryOption === 'Delivery' &&
      preOrderForm.deliveryType !== 'Delivery'
    ) {
      setPreOrderForm((prev) => ({ ...prev, deliveryType: 'Delivery' }));
    }
  }, [selectedAnnouncement, preOrderForm.deliveryType]);

  // Handle Dynamic Pre-Order Submission
  const handlePreOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnnouncement) {
      toast.error('Please select a scheduled cooking event');
      return;
    }
    if (!preOrderForm.customerName.trim() || !preOrderForm.mobileNumber.trim()) {
      toast.error('Please enter your Name and Mobile number');
      return;
    }
    if (preOrderForm.mobileNumber.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (
      preOrderForm.deliveryType === 'Delivery' &&
      (!preOrderForm.address || !preOrderForm.address.trim())
    ) {
      toast.error('Please enter your doorstep delivery address');
      return;
    }

    setSubmittingPreOrder(true);
    try {
      const formattedAddress =
        preOrderForm.deliveryType === 'Self Service' &&
        (!preOrderForm.address || !preOrderForm.address.trim())
          ? 'Self Service / Kitchen Pickup (MI Catering Central Kitchen, Adirampattinam)'
          : preOrderForm.address.trim();

      const payload = {
        orderType: 'pre-order',
        event: selectedAnnouncement._id,
        itemName: selectedAnnouncement.title,
        portionUnit,
        unitPrice,
        numberOfPackets: preOrderQty,
        selectedExtras: selectedExtrasList,
        subtotalAmount: originalSubtotal,
        discountType,
        discountValue,
        discountAmount,
        finalAmount: finalPayableTotal,
        estimatedAmount: finalPayableTotal || originalSubtotal,
        customerName: preOrderForm.customerName.trim(),
        mobileNumber: preOrderForm.mobileNumber.trim(),
        orderDate: selectedAnnouncement.eventDate,
        deliveryType: preOrderForm.deliveryType,
        address: formattedAddress,
        additionalNotes: preOrderForm.additionalNotes.trim(),
      };

      await api.post('/catering/orders', payload);
      toast.success(
        preOrderForm.deliveryType === 'Self Service'
          ? `Pre-order for ${selectedAnnouncement.title} received! We will keep your order ready for pickup.`
          : `Pre-order for ${selectedAnnouncement.title} received! We will deliver hot to your address.`
      );
      setPreOrderForm({
        customerName: '',
        mobileNumber: '',
        deliveryType: allowedPreOrderDelivery === 'Self Service' ? 'Self Service' : 'Delivery',
        address: '',
        additionalNotes: '',
      });
      setPreOrderExtras({});
      setPreOrderQty(selectedAnnouncement.minPackets || 1);
      setIsPreOrderModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pre-order submission failed. Please try again.');
    } finally {
      setSubmittingPreOrder(false);
    }
  };

  // Handle General Quotation Submission
  const handleQuotationSubmit = async (e) => {
    e.preventDefault();
    if (
      !quotationForm.itemName ||
      !quotationForm.customerName.trim() ||
      !quotationForm.mobileNumber.trim() ||
      !quotationForm.numberOfPackets ||
      !quotationForm.orderDate
    ) {
      toast.error('Please fill all required fields');
      return;
    }
    if (quotationForm.mobileNumber.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (
      quotationForm.deliveryType === 'Delivery' &&
      (!quotationForm.address || !quotationForm.address.trim())
    ) {
      toast.error('Please enter your delivery or event venue address');
      return;
    }

    setSubmittingQuotation(true);
    try {
      const finalNotes = [
        quotationForm.customExtras ? `Requested Extras: ${quotationForm.customExtras}` : '',
        quotationForm.additionalNotes,
      ]
        .filter(Boolean)
        .join(' | ');

      const formattedAddress =
        quotationForm.deliveryType === 'Self Service' &&
        (!quotationForm.address || !quotationForm.address.trim())
          ? 'Self Service / Kitchen Pickup (MI Catering Central Kitchen, Adirampattinam)'
          : quotationForm.address.trim();

      const payload = {
        orderType: 'quotation',
        itemName: quotationForm.itemName,
        customerName: quotationForm.customerName.trim(),
        mobileNumber: quotationForm.mobileNumber.trim(),
        numberOfPackets: Number(quotationForm.numberOfPackets) || 1,
        orderDate: quotationForm.orderDate,
        deliveryType: quotationForm.deliveryType,
        address: formattedAddress,
        foodRequirements: quotationForm.foodRequirements.trim(),
        additionalNotes: finalNotes,
      };

      await api.post('/catering/orders', payload);
      toast.success(
        'Catering quotation request submitted! Our culinary coordinator will contact you promptly.'
      );
      setQuotationForm({
        itemName: 'Grand Wedding Feast (Biryani / Traditional Meals)',
        customerName: '',
        mobileNumber: '',
        numberOfPackets: '',
        orderDate: '',
        deliveryType: 'Delivery',
        address: '',
        foodRequirements: '',
        customExtras: '',
        additionalNotes: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmittingQuotation(false);
    }
  };

  const handleResetQuotation = () => {
    setQuotationForm({
      itemName: 'Grand Wedding Feast (Biryani / Traditional Meals)',
      customerName: '',
      mobileNumber: '',
      numberOfPackets: '',
      orderDate: '',
      deliveryType: 'Delivery',
      address: '',
      foodRequirements: '',
      customExtras: '',
      additionalNotes: '',
    });
    toast('Quotation form reset.', { icon: '🧹' });
  };

  return (
    <div className="business-page business-page--catering">
      <CateringHero
        cookingAnnouncements={cookingAnnouncements}
        onSelectAnnouncement={handleSelectAnnouncement}
      />
      <CateringGallery />

      <CookingTicker
        cookingAnnouncements={cookingAnnouncements}
        onSelectAnnouncement={handleSelectAnnouncement}
      />

      <CookingAnnouncements
        cookingAnnouncements={cookingAnnouncements}
        selectedAnnouncement={selectedAnnouncement}
        onToggleSelectAnnouncement={handleToggleSelectAnnouncement}
        onSelectAnnouncement={handleSelectAnnouncement}
      />

      <CateringAbout />

      <CateringQuotationForm
        quotationForm={quotationForm}
        setQuotationForm={setQuotationForm}
        defaultPackages={defaultPackages}
        submittingQuotation={submittingQuotation}
        onSubmitQuotation={handleQuotationSubmit}
        onResetQuotation={handleResetQuotation}
      />

      <PreOrderModal
        isOpen={isPreOrderModalOpen}
        onClose={() => setIsPreOrderModalOpen(false)}
        selectedAnnouncement={selectedAnnouncement}
        preOrderQty={preOrderQty}
        setPreOrderQty={setPreOrderQty}
        preOrderExtras={preOrderExtras}
        updatePreOrderExtraQty={updatePreOrderExtraQty}
        handleRemovePreOrderExtra={handleRemovePreOrderExtra}
        selectedExtrasList={selectedExtrasList}
        unitPrice={unitPrice}
        portionUnit={portionUnit}
        mainDishSubtotal={mainDishSubtotal}
        originalSubtotal={originalSubtotal}
        discountType={discountType}
        discountValue={discountValue}
        discountAmount={discountAmount}
        finalPayableTotal={finalPayableTotal}
        preOrderForm={preOrderForm}
        setPreOrderForm={setPreOrderForm}
        submittingPreOrder={submittingPreOrder}
        onSubmitPreOrder={handlePreOrderSubmit}
      />
    </div>
  );
}
