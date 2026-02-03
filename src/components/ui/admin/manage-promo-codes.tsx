"use client";

import { Button } from "../button";
import { Card, CardContent, CardFooter } from "../card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../field";
import { Input } from "../input";
import { Separator } from "../separator";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group";
import { Clock2Icon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { toast } from "sonner";

export default function ManagePromoCodes() {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 12),
  );
  const [willExpire, setWillExpire] = useState(false);
  const [startingDate, setStartingDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 12),
  );
  const [willStart, setWillStart] = useState(false);
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);
  const [maxUsers, setMaxUsers] = useState<number | null>(null);
  const [codeName, setCodeName] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState<string | null>(null);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  function onTimeChangeExpiration(e: React.ChangeEvent<HTMLInputElement>) {
    if (!expiryDate) return;

    const [hours, minutes, seconds] = e.target.value.split(":").map(Number);

    const next = new Date(expiryDate);
    next.setHours(hours, minutes, seconds || 0, 0);

    setExpiryDate(next);
  }

  async function createCode() {
    const res = await fetch("/api/promo-codes/create", {
      method: "POST",
      body: JSON.stringify({
        code: codeName,
        value: codeValue,
        expiryDate: willExpire && expiryDate && +expiryDate,
        startDate: willStart && startingDate && +startingDate,
        maxUsers,
      }),
    });

    const json = await res.json();

    if (res.ok) {
      toast.success("Promo code created!");
    } else {
      toast.error("Error creating promo code: " + json.message);
    }
  }

  return (
    <Card className="px-4 w-[90%]">
      <h2 className="text-3xl">Manage promo codes</h2>
      <Separator />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createCode();
        }}
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Create</FieldLegend>
            <FieldDescription>
              This promo code will be available as soon as you create it
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Promo Code Name</FieldLabel>
                <Input
                  value={codeName ?? ""}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="gimmechips"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Code Value</FieldLabel>
                <Input
                  type="number"
                  value={codeValue ? +codeValue : ""}
                  onChange={(e) => setCodeValue(e.target.value)}
                  placeholder="1000000"
                  required
                />
                <FieldDescription>
                  This is the amount of chips that the user will receive.
                </FieldDescription>
              </Field>
              <FieldSeparator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  Expiration
                  <div className="flex gap-3">
                    <RadioGroup
                      className="max-w-sm"
                      value={willExpire ? "true" : "false"}
                      onValueChange={(val) => setWillExpire(JSON.parse(val))}
                    >
                      <FieldLabel htmlFor="no-expire">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Doesn&apos;t expire</FieldTitle>
                            <FieldDescription>
                              This is the default option. The promo code can be
                              used once per user at any time.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem id="no-expire" value="false" />
                        </Field>
                      </FieldLabel>

                      <FieldLabel htmlFor="expires">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Expires</FieldTitle>
                            <FieldDescription>
                              Any user can still use the code but now it will
                              expire on the selected date.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem id="expires" value="true" />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                    <Card className="mx-auto w-fit">
                      <CardContent>
                        <Calendar
                          timeZone={timeZone}
                          mode="single"
                          selected={expiryDate}
                          onSelect={(date) => {
                            if (!date) return;

                            const next = new Date(date);
                            if (expiryDate) {
                              next.setHours(
                                expiryDate.getHours(),
                                expiryDate.getMinutes(),
                                expiryDate.getSeconds(),
                                0,
                              );
                            }

                            setExpiryDate(next);
                          }}
                          className="p-0"
                          disabled={!willExpire}
                        />
                      </CardContent>
                      <CardFooter className="border-t bg-card">
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="time-from">
                              Expiration Time
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                type="time"
                                step="1"
                                value={
                                  expiryDate
                                    ? expiryDate.toTimeString().slice(0, 8)
                                    : "12:00:00"
                                }
                                onChange={onTimeChangeExpiration}
                                disabled={!willExpire}
                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              />
                              <InputGroupAddon>
                                <Clock2Icon className="text-muted-foreground" />
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                        </FieldGroup>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  Starting Date
                  <div className="flex gap-3">
                    <RadioGroup
                      className="max-w-sm"
                      value={willStart ? "true" : "false"}
                      onValueChange={(val) => setWillStart(JSON.parse(val))}
                    >
                      <FieldLabel htmlFor="no-start">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Doesn&apos;t start</FieldTitle>
                            <FieldDescription>
                              This is the default option. The promo code will be
                              available for use as soon as it is created.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem id="no-start" value="false" />
                        </Field>
                      </FieldLabel>

                      <FieldLabel htmlFor="starts">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Starts</FieldTitle>
                            <FieldDescription>
                              Users will only be able to use this code after the
                              selected date.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem id="starts" value="true" />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                    <Card className="mx-auto w-fit">
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={startingDate}
                          onSelect={(date) => {
                            if (!date) return;

                            const next = new Date(date);
                            if (startingDate) {
                              next.setHours(
                                startingDate.getHours(),
                                startingDate.getMinutes(),
                                startingDate.getSeconds(),
                                0,
                              );
                            }

                            setStartingDate(next);
                          }}
                          className="p-0"
                          timeZone={timeZone}
                          disabled={!willStart}
                        />
                      </CardContent>
                      <CardFooter className="border-t bg-card">
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="time-from">
                              Start Time
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                type="time"
                                step="1"
                                value={
                                  expiryDate
                                    ? expiryDate.toTimeString().slice(0, 8)
                                    : "12:00:00"
                                }
                                onChange={onTimeChangeExpiration}
                                disabled={!willStart}
                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              />
                              <InputGroupAddon>
                                <Clock2Icon className="text-muted-foreground" />
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                        </FieldGroup>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
              <FieldSeparator />
              <Field>
                <FieldLabel>Amount of users that can use</FieldLabel>
                <Input
                  type="number"
                  value={maxUsers ?? undefined}
                  onChange={(event) =>
                    setMaxUsers(event.target.value ? +event.target.value : null)
                  }
                  placeholder="0 (Unlimited)"
                />
                <FieldDescription>
                  Once this amount of users is exceeded, the code may still be
                  used if you force enable it below.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
          </Field>
        </FieldGroup>
      </form>
    </Card>
  );
}
