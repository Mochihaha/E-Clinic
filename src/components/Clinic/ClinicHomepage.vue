<template>
  <div class="hello">
    <div id="sideNavBar">
      <h3>E-Clinic</h3>
      <router-link to="/clinichome">Dashboard</router-link><br />
      <router-link to="/doctorslist">Doctors</router-link><br />
      <router-link to="/patientsnotes">Patient Notes</router-link><br />
      <router-link to="/pendingbooking">Pending</router-link><br />
      <router-link to="/clinicsettings">Settings</router-link><br />
      <a @click="signOut" class="button is-primary">Logout</a>
    </div>

    <br />
    <div class="main">
      <div v-if="isUserAuth" id="monthlyPatient">
        <mp></mp>
      </div>

      <div id="rhs">
        <div v-if="isUserAuth" id="verify">
          <router-link to="/pendingbooking" id="numberBoxToPending">
            Total Patients to Verify:<br /><br />
            <p>{{ numOfPatientsToVerify() }}</p>
            As of today
          </router-link>
        </div>

        <br />

        <div v-if="isUserAuth" id="physical">
          <router-link to="/pendingbooking" id="numberBoxToPending">
            Total Patients to Arrange Physical Consultations:<br /><br />
            <p>{{ numOfPatientsPhysical() }}</p>
            As of today
          </router-link>
        </div>
      </div>

      <div id="bottom-half">
        <div v-if="isUserAuth" id="monthlyRev">
          <linechart></linechart>
        </div>
        <div v-if="isUserAuth" id="rating">
          <ratingchart></ratingchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MonthlyRev from "./MonthlyRev.js";
import ratingchart from "./ratingchart";
import MonthlyPatient from "./MonthlyPatients.js";
import { mapGetters, mapActions } from "vuex";
import database from "../../firebase.js";
export default {
  name: "clinichome",
  // props: {
  //   msg: String,
  // },
  components: {
    linechart: MonthlyRev,
    ratingchart,
    mp: MonthlyPatient,
  },
  data() {
    return {
      countVerify: 0,
      countPhysical: 0,
    };
  },
  computed: {
    ...mapGetters(["getUser", "isUserAuth"]),
  },
  methods: {
    ...mapActions(["signOutAction"]),
    signOut() {
      this.signOutAction();
      this.$router.push("/cliniclogin");
    },
    numOfPatientsToVerify: function () {
      let x = this.getUser.displayName;
      database
        .collection("pendingbooking")
        .where("clinic", "==", x)
        .where("firstTime", "==", true)
        .get()
        .then((querySnapshot) => {
          this.countVerify = querySnapshot.size;
        });
      return this.countVerify;
    },
    numOfPatientsPhysical: function () {
      let x = this.getUser.displayName;
      database
        .collection("pendingbooking")
        .where("clinic", "==", x)
        .where("physical", "==", true)
        .get()
        .then((querySnapshot) => {
          this.countPhysical = querySnapshot.size;
        });
      return this.countPhysical;
    },

    getClinicName: function () {
      database
        .collection("clinics")
        .doc(localStorage.getItem("uidClinic"))
        .get()
        .then((doc) => {
          localStorage.setItem("clinicName", doc.data().name);
        });
    },
  },

  created() {
    this.getClinicName();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito&display=swap");
.hello {
  position: relative;
  font-family: Nunito;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: rgb(238, 249, 255);
  transition: 0.3s;
  font-family: Nunito;
  font-size: 17px;
  letter-spacing: 2px;
  display: inline-block;
  margin: 50px 0 0 0;
  text-decoration: none;
}

a:hover {
  font-size: 18px;
  cursor: pointer;
}

#verify {
  transition: box-shadow 0.3s;
  background-image: linear-gradient(
    to right,
    rgb(0, 114, 180),
    rgb(0, 153, 180)
  );
  font-family: Nunito;
  font-size: 15px;
  color: white;
  text-align: left;
  display: inline-block;
  width: 220px;
  height: 120px;
  margin-left: -180px;
  margin-top: 58px;
  padding: 10px 10px 10px 16px;
  border-radius: 10px;
}
#rhs {
  position: absolute;
  left: 970px;
  top: 0px;
  width: 250px;
}
#numberBoxToPending {
  margin: 0px;
  width: 220px;
  height: 150px;
  left: 830px;
  font-size: 15px;
  display: block;
}
#verify p {
  font-size: 38px;
  font-weight: bold;
  margin: 0;
}

#verify:hover {
  box-shadow: 0 0 14px rgba(33, 33, 33, 0.719);
}

#physical {
  transition: box-shadow 0.3s;
  background-image: linear-gradient(to left, rgb(144, 0, 180), rgb(99, 0, 180));
  font-family: Nunito;
  font-size: 15px;
  color: white;
  text-align: left;
  display: inline-block;
  width: 220px;
  height: 140px;
  margin-left: -180px;
  margin-top: 45px;
  padding: 12px 10px 10px 16px;
  border-radius: 10px;
}

#physical p {
  font-size: 38px;
  font-weight: bold;
  margin: 0;
}

#physical:hover {
  box-shadow: 0 0 14px rgba(33, 33, 33, 0.719);
}

#monthlyPatient {
  height: 100%;
  width: 550px;
  /* border-style: solid;
  border-color: rgb(0, 114, 180);
  border-width: 1px; */
  padding: 0px 30px 30px;
  margin: 10px;
  float: left;
}

#monthlyRev {
  height: 100%;
  width: 380px;
  padding: 0px 20px 30px;
  margin: 10px;
  display: inline-block;
  float: left;
}
#rating {
  height: 100%;
  width: 400px;
  padding: 0px 20px;
  margin: 10px;
  display: inline-block;
  float: left;
}
#bottom-half {
  position: absolute;
  height: 400px;
  top: 450px;
  left: 260px;
  display: block;
}
/*#rating {
  height: 240px;
  width: 300px;
  border-color: rgb(0, 114, 180);
  padding-bottom: 60px;
  padding-right: 100px;
}*/

#sideNavBar {
  width: 180px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-x: hidden;
  height: 100%;
  /* border: 1px solid white; */
  /* border-radius: 5px; */
  background-color: rgb(0, 114, 180);
  color: rgb(238, 249, 255);
  font-weight: bold;
  letter-spacing: 2px;
  height: 100%;
  z-index: 4;
}

#sideNavBar h3 {
  font-family: Nunito;
  font-size: 24px;
  letter-spacing: 4px;
  color: white;
  font-weight: bold;
  padding: 10px 0px 0px 0px;
}

.main {
  margin-top: -20px;
  margin-left: 160px;
  padding: 0px 60px;
}
</style>
