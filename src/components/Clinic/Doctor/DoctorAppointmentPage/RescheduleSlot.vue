<template>
  <div>
    <h3>Reschedule Consultation Slot for {{ oldSlot }}</h3>

    <form v-on:submit.prevent="rescheduleSlot(slotData)">
      <label>Choose the new <b>Start Time</b> </label>
      <input
        type="time"
        id="startTime"
        name="consultStart"
        step="1800"
        min="08:30"
        max="18:00"
        list="slotTimes"
        required
        v-model="newStartTime"
      />

      <!--label>Choose Slot <b>End Time</b></label-->
      <!--input type="time" id="endTime" name="consultEnd" step="1800" min=this.slotStartTime max="18:00" required v-model="slotEndTime"-->
      <!--min and max can be the opening and closing time of the clinic :D -->
      <datalist id="slotTimes">
        <option>08:30</option>
        <option>09:00</option>
        <option>09:30</option>
        <option>10:00</option>
        <option>10:30</option>
        <option>11:00</option>
        <option>11:30</option>
        <option>12:00</option>
        <option>12:30</option>
        <option>13:00</option>
        <option>13:30</option>
        <option>14:00</option>
        <option>14:30</option>
        <option>15:00</option>
        <option>15:30</option>
        <option>16:00</option>
        <option>16:30</option>
        <option>17:00</option>
        <option>17:30</option>
        <option>18:00</option>
        <option>18:30</option>
        <option>19:00</option>
        <option>19:30</option>
        <option>20:00</option>
        <option>20:30</option>
        <option>21:00</option>
        <option>21:30</option>
      </datalist>

      <label>Choose the new <b>Start Date</b></label>
      <v-date-picker
        v-model="date"
        :masks="masks"
        :min-date="this.min.setDate(this.slotData.date.toDate().getDate() + 1)"
      >
        <template v-slot="{ inputValue, inputEvents }">
          <input
            class="bg-white border px-2 py-1 rounded"
            :value="inputValue"
            v-on="inputEvents"
          />
        </template>
      </v-date-picker>

      <span>
        <input id="submitButton" type="submit" value="Submit" />
        <button v-on:click="slotData.reschedule = false" id="cancelButton">
          Cancel
        </button>
      </span>
    </form>
  </div>
</template>

<script>
import database from "../../../../firebase";
import firebase from "firebase/app";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      newStartTime: "",
      date: new Date(),
      min: this.slotData.date.toDate(),
      masks: {
        input: "DD/MM/YYYY",
      },
    };
  },
  props: {
    slotData: {
      type: Object,
    },
  },
  computed: {
    oldSlot: function () {
      return this.slotData.date.toDate().toDateString();
    },
    ...mapGetters(["getUser"]),
  },
  methods: {
    checkNewDate: function (rDate) {
      let results = [];
      let promise = [];
      promise.push(
        database
          .collection("consultslots")
          .where("doctor", "==", this.slotData.doctor) //doctor that is logged in
          .where("date", "==", rDate)
          .where("patient", "!=", null)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              results.push(doc.id, " => ", doc.data());
            });
            if (results.length > 0) {
              return false;
            }
          })
      );
      return promise;
    },
    rescheduleSlot: function (d) {
      var currentSlot = database.collection("consultslots").doc(d.id);
      //var newDate = d.date.toDate();
      var newDate = this.date;
      newDate.setHours(parseInt(this.newStartTime.substr(0, 2)));
      newDate.setMinutes(parseInt(this.newStartTime.substr(3, 2)));
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      var newTimestamp = firebase.firestore.Timestamp.fromDate(newDate);

      this.checkNewDate(newTimestamp)[0].then((res) => {
        if (res != false) {
          let item = {
            date: newTimestamp,
            patient: d.patient,
            doctor: d.doctor, //get name of the doctor who is currently logged in -> should be a global variable across the entire AppointmentPage component
            rating: d.rating,
            conditions: d.conditions,
            clinic: this.getUser.displayName,
          };
          //add
          database.collection("consultslots").add(item);
          //remove
          currentSlot.get().then(
            //let li = document.getElementById(doc.id);
            //li.parentNode.removeChild(li);
            currentSlot.delete()
            //this.consultData.pop(); should I emit this?
            //console.log(this.consultData.length);
            //if (this.consultData.length == 0) {
            //  this.$emit("fetchItems");
            //}
          );
          var ifASlotExistsQuery = database
            .collection("consultslots")
            .where("date", "==", newDate)
            .where("patient", "==", null);
          ifASlotExistsQuery.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log("deleted corresponding free slot");
              doc.ref.delete();
            });
            database
              .collection("consultslots")
              .get()
              .then((snapshot) => {
                try {
                  snapshot.forEach((doc) => {
                    if (item.date.isEqual(doc.data().date)) {
                      item.id = doc.id;
                      item.hover = false;
                      item.reschedule = false;
                      if (
                        item.date.toDate().getDate() ==
                          d.date.toDate().getDate() &&
                        item.date.toDate().getMonth() ==
                          d.date.toDate().getMonth() &&
                        item.date.toDate().getFullYear() ==
                          d.date.toDate().getFullYear()
                      ) {
                        this.$emit("changeTile", d, item, true);
                      } else {
                        this.$emit("changeTile", d, item, false);
                      }
                      throw "break";
                    }
                  });
                } catch (exception) {
                  console.log("shld break");
                }
              });
          });

          /*
           * adding part to notify patient
           * update patient upcoming field
           * update patient appointment history
           */
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          var e = new Date(newTimestamp.seconds * 1000);
          var f =
            e.getDate() +
            " " +
            monthNames[e.getMonth()] +
            " " +
            e.getFullYear();
          var h = this.formatTime(e);
          console.log(h);
          database
            .collection("patients")
            .doc(d.patient)
            .get()
            .then((doc) => {
              let item = doc.data();
              let newMessages = item.newNotifications;
              newMessages.splice(
                0,
                0,
                this.formatDate(new Date()) +
                  ": Your consultation at " +
                  d.clinic +
                  " has been rescheduled."
              );
              console.log(newMessages);
              let newmap = item.appointment_history;
              var index = newmap[d.clinic].indexOf(item.upcoming[1]);
              console.log(index);
              if (index != -1) {
                newmap[d.clinic].splice(index, 1, f);
              }

              database
                .collection("patients")
                .doc(d.patient)
                .update({
                  newNotifications: newMessages,
                  appointment_history: newmap,
                  upcoming: {
                    0: "online",
                    1: f,
                    2: h,
                    3: d.clinic,
                  },
                });
            });

          alert("Successfully rescheduled slot!");
        } else {
          alert("Slot you are trying to reschedule to is not available!");
        }
      });
    },

    formatDate: function (date) {
      let filter_year = date.getFullYear();
      let filter_month = date.getMonth() + 1;
      let filter_day = date.getDate();
      return filter_day + "/" + filter_month + "/" + filter_year;
    },
    formatTime: function (time) {
      let min = time.getMinutes();
      let h = time.getHours();
      if (h < 10) {
        h = "0" + h;
      }
      if (min == 0) {
        min = "00";
      }
      return h + ":" + min;
    },
  },
  // watch: {
  //   rescheduleSlot: function () {
  //     database.collection("consultslots").onSnapshot((snapshot) => {
  //       let changes = snapshot.docChanges();
  //       changes.forEach((change) => {
  //         console.log(change.doc.data());
  //         if (change.type == "modified") {
  //           console.log("Modified Time Slot: ", change.doc.data());
  //           let li = document.getElementById(change.doc.id);
  //           li.setAttribute("data-id", change.doc.id);
  //         }
  //       });
  //     });
  //   },
  // },
};
</script>

<style scoped>
span {
  display: block;
  margin: 40px;
}
#cancelButton,
#submitButton {
  background-color: white;
  border: 1px solid rgb(0, 114, 180);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-family: Roboto;
  color: rgb(0, 114, 180);
  letter-spacing: 3px;
  font-weight: bold;
  outline: none;
  margin: 20px;
}

#cancelButton:hover,
#submitButton:hover {
  background-color: rgb(0, 114, 180);
  border: 1px solid white;
  box-shadow: 0 0 11px rgba(33, 33, 33, 0.35);
  color: rgb(0, 114, 180);
  color: white;
}

form {
  align-items: center;
  display: inline-block;
  margin: 10px;
}

#createCustomSlot {
  padding: 10px;
  margin: 10px;
  display: inline-block;
}
label {
  margin: 20px;
  display: inline-block;
  font-family: Roboto;
}

#startTime {
  padding: 10px;
  font-family: Nunito;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  display: inline-block;
  align-items: center;
}
</style>