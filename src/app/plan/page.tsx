"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, X, Plus, MapPin, Calendar, DollarSign, Settings } from "lucide-react"
import type { FormData, PlanRequest } from "@/types"

const initialFormData: FormData = {
  destinations: [{ id: '1', value: '' }],
  origin: '',
  travelWindow: {
    start: '',
    end: ''
  },
  duration: {
    min: 7,
    max: 14
  },
  budget: {
    currency: 'USD',
    perPerson: true
  },
  partySize: 1,
  baggage: 1,
  cabin: 'Economy',
  nightBusAllowed: false,
  refundableOnly: false,
  maxHops: 4,
  excludedCities: [],
  notes: ''
};

export default function PlanPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const steps = [
    {
      title: 'Where to?',
      description: 'Tell us your destinations and starting point'
    },
    {
      title: 'When?',
      description: 'Select your travel dates and duration'
    },
    {
      title: 'Budget & Party',
      description: 'Set your budget and party size'
    },
    {
      title: 'Preferences',
      description: 'Configure your travel preferences'
    }
  ];

  const addDestination = () => {
    const newId = (formData.destinations.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { id: newId, value: '' }]
    }));
  };

  const removeDestination = (id: string) => {
    if (formData.destinations.length > 1) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.filter(d => d.id !== id)
      }));
    }
  };

  const updateDestination = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => d.id === id ? { ...d, value } : d)
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return formData.destinations.some(d => d.value.trim()) && formData.origin.trim();
      case 1:
        return formData.travelWindow.start && formData.travelWindow.end;
      case 2:
        return formData.partySize > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep()) return;

    setLoading(true);

    try {
      const planRequest: PlanRequest = {
        destinations: formData.destinations
          .filter(d => d.value.trim())
          .map(d => d.value.trim()),
        origin: formData.origin.trim(),
        travelWindow: formData.travelWindow,
        duration: formData.duration,
        budget: Object.keys(formData.budget).length > 2 ? formData.budget : undefined,
        partySize: formData.partySize,
        baggage: formData.baggage,
        cabin: formData.cabin,
        nightBusAllowed: formData.nightBusAllowed,
        refundableOnly: formData.refundableOnly,
        maxHops: formData.maxHops,
        excludedCities: formData.excludedCities.filter(c => c.trim()),
        notes: formData.notes.trim() || undefined
      };

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planRequest)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create plan');
      }

      router.push(`/progress/${result.tripId}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tell us about your travel dreams and we'll create the perfect itinerary
          </p>
          
          {/* Step Progress */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const Icon = [MapPin, Calendar, DollarSign, Settings][index]
              const isActive = index <= currentStep
              const isCurrent = index === currentStep
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isActive 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-background border-border text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary/20' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${isActive ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>
          
          <Progress value={((currentStep + 1) / steps.length) * 100} className="max-w-md mx-auto" />
          
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-base">{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Step 0: Destinations */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="origin" className="text-base font-medium mb-3 block">
                    Where are you starting from?
                  </Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="e.g., Delhi, New York (JFK), London"
                    className="text-base h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Destinations
                  </Label>
                  <div className="space-y-3">
                    {formData.destinations.map((destination, index) => (
                      <div key={destination.id} className="flex gap-3">
                        <Input
                          value={destination.value}
                          onChange={(e) => updateDestination(destination.id, e.target.value)}
                          placeholder={`Destination ${index + 1} (e.g., Paris, Western Europe, Japan)`}
                          className="flex-1 text-base h-12"
                        />
                        {formData.destinations.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeDestination(destination.id)}
                            className="h-12 w-12 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addDestination}
                      className="w-full h-12 text-base"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add another destination
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Travel Window */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-base font-medium mb-3 block">
                      Travel window start
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.travelWindow.start}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        travelWindow: { ...prev.travelWindow, start: e.target.value }
                      }))}
                      className="text-base h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-base font-medium mb-3 block">
                      Travel window end
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.travelWindow.end}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        travelWindow: { ...prev.travelWindow, end: e.target.value }
                      }))}
                      className="text-base h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minDays" className="text-base font-medium mb-3 block">
                      Minimum days
                    </Label>
                    <Input
                      id="minDays"
                      type="number"
                      value={formData.duration.min}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        duration: { ...prev.duration, min: parseInt(e.target.value) || 1 }
                      }))}
                      min="1"
                      className="text-base h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDays" className="text-base font-medium mb-3 block">
                      Maximum days
                    </Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={formData.duration.max}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        duration: { ...prev.duration, max: parseInt(e.target.value) || 1 }
                      }))}
                      min="1"
                      className="text-base h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Party */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="partySize" className="text-base font-medium mb-3 block">
                    Party size
                  </Label>
                  <Input
                    id="partySize"
                    type="number"
                    value={formData.partySize}
                    onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="text-base h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Budget (optional)
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.budget.min || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, min: parseInt(e.target.value) || undefined }
                      }))}
                      className="text-base h-12"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.budget.max || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, max: parseInt(e.target.value) || undefined }
                      }))}
                      className="text-base h-12"
                    />
                    <Select
                      value={formData.budget.currency}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, currency: value }
                      }))}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="perPerson"
                      checked={formData.budget.perPerson}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, perPerson: !!checked }
                      }))}
                    />
                    <Label htmlFor="perPerson" className="text-base">Per person</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baggage" className="text-base font-medium mb-3 block">
                      Baggage pieces per person
                    </Label>
                    <Input
                      id="baggage"
                      type="number"
                      value={formData.baggage}
                      onChange={(e) => setFormData(prev => ({ ...prev, baggage: parseInt(e.target.value) || 1 }))}
                      min="0"
                      className="text-base h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Cabin class
                    </Label>
                    <Select
                      value={formData.cabin}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, cabin: value as any }))}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Economy">Economy</SelectItem>
                        <SelectItem value="PremiumEconomy">Premium Economy</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="First">First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="nightBus"
                      checked={formData.nightBusAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nightBusAllowed: !!checked }))}
                    />
                    <Label htmlFor="nightBus" className="text-base">Allow night buses</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="refundable"
                      checked={formData.refundableOnly}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, refundableOnly: !!checked }))}
                    />
                    <Label htmlFor="refundable" className="text-base">Refundable only</Label>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Maximum city hops: {formData.maxHops}
                  </Label>
                  <Slider
                    value={[formData.maxHops]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, maxHops: value[0] }))}
                    min={2}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>2</span>
                    <span>8</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-base font-medium mb-3 block">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific requirements or preferences..."
                    rows={4}
                    className="text-base"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-8 h-12 text-base"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceedToNextStep() || loading}
                className="px-8 h-12 text-base"
              >
                {loading ? (
                  'Creating...'
                ) : currentStep === steps.length - 1 ? (
                  'Create Plan'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}